#!/usr/bin/env node

const { error } = require('console');
const fs = require('fs-extra');
const unzipper = require('unzipper');
const archiver = require('archiver');
const path = require('path');
const crypto = require('crypto');

const arguments = process.argv;
console.log("First custom argument:", arguments[2]);
const command = arguments[2];

switch(command){
    case 'init':{
        HandlerInit();
        break;
    }
    case 'clone':{
        const link = arguments[3];
        HandlerClone(link);
        break;
    }
    case 'commit':{
        const message = arguments[3];
        HandlerCommit(message);
        break;
    }
    case 'push':{
        HandlerPush();
        break;
    }
    case 'pull':{

        break;
    }
};

function HandlerInit(){
    let folderName1 = '.custard';
    let folderName2 = '.custard/config.json';
    let folderName3 = '.custard/logs.json';

    if(!fs.existsSync(folderName1)){
        fs.mkdirSync(folderName1);
        fs.mkdirSync(`${folderName1}/blobs`);
    }
    if(!fs.existsSync(folderName2)){
        fs.writeFileSync(folderName2, JSON.stringify({
            "remoteLink": "",
            "projectName": "",
        }));
    }
    if(!fs.existsSync(folderName3)){
        fs.writeFileSync(folderName3, JSON.stringify([]));
    }
}

async function HandlerClone(link){
    try{
        const res = await fetch(link,{
            headers:{
                'User-Agent': 'gitcustard-1.0.0'
            }
        });
        if(!res.ok){
            throw new Error('Failed to clone repository'); 
        }
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile('gitcustard.zip', buffer);
        console.log('✅ Repo downloaded as gitcustard.zip');
        let ProjectName = await unzipperFunction();
        AddRemote(link,ProjectName);
    }catch(error){
        console.log('error:',error);
    }
}

async function unzipperFunction(zipPath = 'gitcustard.zip') {
    const outputDir = process.cwd();
    let ProjectName;
    const directory = await unzipper.Open.file(zipPath);
    const firstEntry = directory.files[0];

    if (firstEntry && firstEntry.path.includes('/')) {
        ProjectName = firstEntry.path.split('/')[0];
    }

    for(let i=1; i<directory.files.length; i++){
        let file = directory.files[i];
        let filePath = file.path;
        console.log(`file${i}: ${filePath}`);
        let filePathArray = filePath.split("/");
        let newArray = filePathArray.slice(1);
        filePath = newArray.join("/");
        let newPath = path.join(outputDir, filePath);

        if (file.type === 'Directory') {
            await fs.ensureDir(newPath);
        } else {
            await fs.ensureDir(path.dirname(newPath));
            const contentBuffer = await file.buffer();
            await fs.writeFile(newPath, contentBuffer);
        }
    }
    fs.remove('gitcustard.zip');
    return ProjectName;
}

function AddRemote(link,ProjectName){
    const config = JSON.parse(fs.readFileSync('.custard/config.json'));
    console.log("prj",ProjectName);
    config.remoteLink = link;
    config.projectName = ProjectName;
    fs.writeFileSync('.custard/config.json', JSON.stringify(config));
}

async function HandlerCommit(message){
    const config = JSON.parse(fs.readFileSync('.custard/config.json'));
    const logs = JSON.parse(fs.readFileSync('.custard/logs.json'));
    let idx;
    if(logs.length === 0){
        idx = 1;
    }else{
        idx = logs[logs.length-1].commitId + 1;
    }
    logs.push({
        commitId: idx,
        projectName: config.projectName,
        commitMessage: message,
        files: AddBlobs(),
        timestamp: new Date().toISOString()
    });
    fs.writeFileSync('.custard/logs.json', JSON.stringify(logs));
}

async function AddBlobs() {
    /*return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
    
        output.on('close', () => {
            console.log(`Zipped successfully: ${outZipPath} (${archive.pointer()} bytes)`);
            resolve();
        });
    
        archive.on('error', err => reject(err));
    
        archive.pipe(output);*/
    
        //archive.glob('**/*', {
        /*    cwd: sourceDir,
            dot: true,
            ignore: getCustardIgnorePatterns(sourceDir)
        });
    
        archive.finalize();
    });*/
    const logs = JSON.parse(fs.readFileSync('.custard/logs.json'));
    const blobsDir = '.custard/blobs';
    const idx = logs.length; 
    const prevFiles = idx > 0 ? logs[idx - 1].files : {};
    const mainDir = process.cwd();
    const currFiles = fs.readdirSync(mainDir);

    function getFileHash(filePath) {
        const content = fs.readFileSync(filePath);
        return crypto.createHash('sha1').update(content).digest('hex');
    }

    for (const currfile of currFiles) {
        const currPath = path.join(mainDir, currfile);

        if (currPath.includes('.custard')) continue;

        if (fs.lstatSync(currPath).isDirectory()) continue;

        const currBlobHash = getFileHash(currPath);
        const prevBlobHash = prevFiles[currfile]; 

        if (!prevBlobHash) {
            console.log(`${currfile} => Added`);
            const blobPath = path.join(blobsDir, currBlobHash);
            fs.copyFileSync(currPath, blobPath); 
        } else if (currBlobHash !== prevBlobHash) {
            console.log(`${currfile} => Modified`);
            const blobPath = path.join(blobsDir, currBlobHash);
            fs.copyFileSync(currPath, blobPath); 
        } else {
            console.log(`${currfile} => Unmodified`);
        }
    }
}

/*function getCustardIgnorePatterns(sourceDir) {
    const defaultIgnores = ['node_modules/**'];
    const ignoreFile = `${sourceDir}/.custardignore`;
  
    if (!fs.existsSync(ignoreFile)) return defaultIgnores;
  
    const content = fs.readFileSync(ignoreFile, 'utf-8');
    const customIgnores = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  
    return [...defaultIgnores, ...customIgnores];
}*/

async function HandlerPush(){
    const config = JSON.parse(fs.readFileSync('.custard/config.json'));
    const logs = JSON.parse(fs.readFileSync('.custard/logs.json'));
    const link = config.remoteLink;
    const ProjectName = logs[logs.length-1].zipFolderLoc;
    // Logic to Send the Zip folder to Code Sphere
}
  