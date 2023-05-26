var fs = require('fs');
var path = require('path');

class ProfileSystem{
    
    constructor(){
        this.profilesData = {}
        this.readFile()
    }

    readFile(){
        const profiles = JSON.parse(fs.readFileSync(path.join(__dirname,'profiles.json'), 'utf8'));
        this.profilesData = profiles;
    }   
}

module.exports = new ProfileSystem;