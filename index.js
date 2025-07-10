#!/usr/bin/env node

const { error } = require('console');
const fs = require('fs-extra');
const unzipper = require('unzipper');
const archiver = require('archiver');

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
        fs.mkdirSync(`${folderName1}/commits`);
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
  
    try {
      await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: outputDir }))
        .promise();
  
      console.log(`Unzipped to: ${outputDir}`);
      fs.remove('gitcustard.zip');
    } catch (err) {
      console.error('Failed to unzip:', err.message);
    }
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
    await zipFolder(config.projectName,`.custard/commits/commit-${idx}-${config.projectName}.zip`);
    logs.push({
        commitId: idx,
        projectName: config.projectName,
        commitMessage: message,
        zipFolderLoc: `commits/commit-${idx}-${config.projectName}.zip`,
        timestamp: new Date().toISOString()
    });
    fs.writeFileSync('.custard/logs.json', JSON.stringify(logs));
}

async function zipFolder(sourceDir, outZipPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
    
        output.on('close', () => {
            console.log(`✅ Zipped successfully: ${outZipPath} (${archive.pointer()} bytes)`);
            resolve();
        });
    
        archive.on('error', err => reject(err));
    
        archive.pipe(output);
    
        archive.glob('**/*', {
            cwd: sourceDir,
            dot: true,
            ignore: getCustardIgnorePatterns(sourceDir)
        });
    
        archive.finalize();
    });
  }

function getCustardIgnorePatterns(sourceDir) {
    const defaultIgnores = ['node_modules/**'];
    const ignoreFile = `${sourceDir}/.custardignore`;
  
    if (!fs.existsSync(ignoreFile)) return defaultIgnores;
  
    const content = fs.readFileSync(ignoreFile, 'utf-8');
    const customIgnores = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
  
    return [...defaultIgnores, ...customIgnores];
}

async function HandlerPush(){
    const config = JSON.parse(fs.readFileSync('.custard/config.json'));
    const logs = JSON.parse(fs.readFileSync('.custard/logs.json'));
    const link = config.remoteLink;
    const ProjectName = logs[logs.length-1].zipFolderLoc;
    // Logic to Send the Zip folder to Code Sphere
}
  