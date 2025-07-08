#!/usr/bin/env node

const { error } = require('console');
const fs = require('fs-extra');
const unzipper = require('unzipper');

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
    case 'pull':{

        break;
    }
    case 'push':{
        HandlerPush();
        break;
    }
};

function HandlerInit(){
    let folderName1 = '.custard';
    let folderName2 = '.custard/config.json';
    if(!fs.existsSync(folderName1)){
        fs.mkdirSync(folderName1);
    }
    if(!fs.existsSync(folderName2)){
        fs.writeFileSync(folderName2, JSON.stringify({
            "remoteLink": "",
            "projectName": "",
        }));
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

async function HandlerPush(){
    const config = JSON.parse(fs.readFileSync('.custard/config.json'));
    const link = config.remoteLink;
    const ProjectName = "/" + config.projectName;
}
  