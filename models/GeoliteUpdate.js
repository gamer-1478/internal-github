async function AddGeoliteRepoWithUser(reponame, owner, users, geoliteConfLocation) {
    // users is an list of objects, where each object has a username and perms, eg [{username:alice, perms:''},{username:'bob', perms:''}], accepted perms, 'owner', 'read', 'readwrite', 'admin'
    // takes in who is the owner, They get RW+ perm and the reponame

    //const geoliteFile = require(geoliteConfLocation)
    var fs = require('fs');

    var lineReader = require('line-reader');

    let someresp = await CheckIfFileContainsRepo('hmm', '');
    console.log(someresp)
    let linenumber = 1
    lineReader.eachLine('./test/test.gitolite.conf', function (line, last) {
        if (line.trim().includes('repo') == true) {
            console.log(line, linenumber);
        }

        linenumber = linenumber + 1;
    });

}

async function CheckIfFileContainsRepo(reponame, geoliteConfLocation) {
    var fs = require('fs');

    var lineReader = require('line-reader');

    let linenumber = 1

    let matched = null;
    await lineReader.eachLine('./test/test.gitolite.conf', async function (line, last) {
        if (line.trim().includes('repo') == true) {
            line = line.replace('repo', '').trim()
            console.log(line, linenumber);
            if (line === reponame) {
                console.log("matched")
                return true
            }
        }
        linenumber = linenumber + 1;
    });
    if (matched != null){
        if (matched == true ){
            return true
        }
        return false
    }
}

function AddUsersToExistingGeoliteRepo(users, reponame, geoliteConfLocation) {
    // takes in users which is an list of objects, where each object has a username and perms, eg [{username:alice, perms:''},{username:'bob', perms:''}], accepted perms, 'owner', 'read', 'readwrite 
    // and reponame

}

function ChangeUserPermsInGeoliteRepo(reponame, username, geoliteConfLocation) {
    //takes in reponame and username

}

function RemoveUserInGeoliteRepo(reponame, user, geoliteConfLocation) {
    //remove user in repo

}

function RemoveGeoliteRepo(repo, geoliteConfLocation) {
    //remove the whole repo

}

function AddGeoliteUser(username, key, geoliteKeydirLocation) {
    // add a new user to giolite directory

}

function RemoveGeoliteUser(username, geoliteKeydirLocation) {
    // remove a geolite user

}

module.exports = { AddGeoliteRepoWithUser, RemoveGeoliteRepo, AddGeoliteUser, AddUsersToExistingGeoliteRepo, RemoveGeoliteUser, RemoveUserInGeoliteRepo, ChangeUserPermsInGeoliteRepo }