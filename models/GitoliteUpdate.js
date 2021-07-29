var fs = require('fs');
var lineReader = require('line-reader');
const insertLine = require('insert-line')
let locked = false

/*THIS FILE DOES NOT SANATISE, IT EXPECTS A ALREADY SANITISED REPONAME, USERNAME, AMONG OTHERS. THIS IS A VERY BUGGY FILE,*
 *PLEASE PASS IN CORRECT FILE LOCATIONS TO SAY THE LEAST, WITHOUT CORRECT CONF LOCATION YOU MAY NOT EVEN GET A RESPONSE,*
 *THIS FILE IS SO BUGGY IS THAT IT WILL JUST GIVE FALSE OR NULL OR NONE WITHOUT CONSISTENCY. GAMER-1478, ME SHOULD MAKE BETTER CODE,*
 *BUT I PROLLY WONT, EH*/

/*users is an list of objects, where each object has a username and perms, eg [{username:alice, perms:''},{username:'bob', perms:''}], accepted perms, 'own', 'r', 'rw', 'ad'
takes in who is the owner, They get RW+ perm and the reponame
const GitoliteFile = require(GitoliteConfLocation)*/
async function AddGitoliteRepoWithUser(reponame, owner, users, GitoliteConfLocation) {
    let CheckIfRepoAlreadyExists = await CheckIfFileContainsRepo(reponame, GitoliteConfLocation);
    if (users.length != 0 && await GitoliteExists(GitoliteConfLocation) == true) {
        let resp = await ParseUsers(users);
        let appendString = `\n\nrepo ${reponame}\n    RW+ = ${owner}\n${resp}`
        if (CheckIfRepoAlreadyExists == false && appendString.length != 0) {
            fs.appendFileSync(GitoliteConfLocation, appendString);
            console.log(`successfully created repo with owner ${owner}`)
            return true
        }
        else {
            console.log(`repo by name ${reponame} already exists! Please chose another name`)
            return false
        }
    } else {
        let appendString = `\n\nrepo ${reponame}\n    RW+ = ${owner}`
        if (CheckIfRepoAlreadyExists == false && appendString.length != 0) {
            fs.appendFileSync(GitoliteConfLocation, appendString);
            console.log(`successfully created repo with owner ${owner}`)
            return true
        }
        else {
            console.log(`repo by name ${reponame} already exists! Please chose another name`)
            return false
        }
    }
}

// takes in users which is an list of objects, where each object has a username and perms, eg [{username:alice, perms:''},{username:'bob', perms:''}], accepted perms, 'owner', 'read', 'readwrite 
// and reponame, to Add to ExistingGitoLiteRepo
async function AddUsersToExistingGitoliteRepo(users, reponame, GitoliteConfLocation) {
    let CheckIfRepoAlreadyExists = await CheckIfRepoAlreadyExistsWithLineNumber(reponame, GitoliteConfLocation);
    if (Number.isInteger(CheckIfRepoAlreadyExists) === true && await GitoliteExists(GitoliteConfLocation) === true) {
        if (users.length != 0) {
            for (const element of users) {
                if (locked === false) {
                    locked = true
                    let resp = await CheckIfUserAlreadyExistsInRepo(reponame, CheckIfRepoAlreadyExists, element.username, element.perms, GitoliteConfLocation)
                    console.log("CheckIfUserAlreadyExistsInRepo", resp)
                    locked = false
                }
            }
            return true
        }
        else {
            return false
        }
    } else {
        return false
    }
}

//takes in reponame and username, Changes user given's Perms in repo
async function ChangeUserPermsInGitoliteRepo(users, reponame, GitoliteConfLocation) {
    let CheckIfRepoAlreadyExists = await CheckIfRepoAlreadyExistsWithLineNumber(reponame, GitoliteConfLocation);
    if (Number.isInteger(CheckIfRepoAlreadyExists) === true && await GitoliteExists(GitoliteConfLocation) === true) {
        if (users.length != 0) {
            for (const element of users) {
                if (locked === false) {
                    locked = true
                    let resp = await CheckIfUserAlreadyExistsInRepo(reponame, CheckIfRepoAlreadyExists, element.username, element.perms, GitoliteConfLocation)
                    console.log("CheckIfUserAlreadyExistsInRepo", resp)
                    locked = false
                }
            }
            return true
        }
        else {
            return false
        }
    } else {
        return false
    }
}

//remove user in repo
function RemoveUserInGitoliteRepo(reponame, user, GitoliteConfLocation) {
}

//remove the whole repo
function RemoveGitoliteRepo(repo, GitoliteConfLocation) {
}

//add a new user to giolite directory
function AddGitoliteUser(username, key, GitoliteKeydirLocation) {
    fs.writeFileSync(GitoliteKeydirLocation+'/'+username+'.pub', key.trim())
    return true
}

//remove a Gitolite user
function RemoveGitoliteUser(username, GitoliteKeydirLocation) {
    fs.unlinkSync(GitoliteKeydirLocation+'/'+username+'.pub')
    return true
}

/*************************************************************************************** INTERNAL FUNCTIONS *************************************************************************************************/
// If gitolite File exists
async function GitoliteExists(GitoliteConfLocation) {
    // See if the file exists
    return await fs.existsSync(GitoliteConfLocation)
}

//parses users
async function ParseUsers(users) {

    let StringToReturn = ''
    await users.forEach((element, index) => {
        element.perms = element.perms.replace("own", "RW+")
        element.perms = element.perms.replace("ad", "RW+")
        element.perms = element.perms.replace("rw", "RW")
        element.perms = element.perms.replace("r", "R")

        if (StringToReturn.length == 0) {
            StringToReturn = StringToReturn + `    ${element.perms} = ${element.username}`
        }
        else {
            StringToReturn = StringToReturn + `\n    ${element.perms} = ${element.username}`
        }
    })
    return (StringToReturn)

}

//check if user already is a Person in the repo and take an appendstring, If user does not exist, will append the string. If it does will return true
async function CheckIfUserAlreadyExistsInRepo(reponame, repoline, username, perms, GitoliteConfLocation) {
    let linenumber = 1
    if (Number.isInteger(repoline) == true) {
        let value1 = null;
        await new Promise(function (resolve, reject) {
            lineReader.eachLine(GitoliteConfLocation, function (line, last, cb) {
                if (linenumber >= repoline) {
                    if (line.trim().includes(username) === true) {
                        line = line.replace(username, '').trim()
                        line = line.replace('=', '').trim()
                        resolve({ perms: line, lineNumberOfUser: linenumber })
                        cb(false)
                    }
                    else if (line.trim() === '') {
                        resolve(false);
                        cb(false)
                    }
                    else {
                        cb();
                    }
                    if (last == true) {
                        resolve(false)
                        //readStream.close();
                    }
                }
                else {
                    cb()
                }
                linenumber = linenumber + 1;
            })
        }).then(function (value) {
            value1 = value
        }).catch(function (err) {
            console.error(err);
        });

        if (value1.hasOwnProperty('perms') && value1 != false) {
            value1.perms = value1.perms.replace("RW+", "ad")
            value1.perms = value1.perms.replace("RW", "rw")
            value1.perms = value1.perms.replace("R", "r")
            console.log(value1)
            if (perms.length != 0) {
                let lineNumberOfUser = value1.lineNumberOfUser;
                if (value1.perms == perms) {
                    return 'found the user already in repo, with same perms, exiting'
                }
                else {
                    var data = fs.readFileSync(GitoliteConfLocation).toString().split("\n");
                    data.splice(lineNumberOfUser - 1, 1);
                    data.splice(lineNumberOfUser - 1, 0, await ParseUsers([{ username: username, perms: perms }]));
                    var text = data.join("\n");
                    fs.writeFile(GitoliteConfLocation, text, function (err) {
                        if (err) return console.log(err);
                    });
                    return 'found the user already in repo, changing his perms'
                }
            }
            else {
                return true
            }
        } else if (value1 === false) {
            if (perms.length != 0) {
                // user already doesn't exit, so Lets just add a user in The Top Line Of the repo
                //await insertLine(GitoliteConfLocation).content(await ParseUsers([{ username: username, perms: perms }])).atsync(repoline + 1)
                var data = fs.readFileSync(GitoliteConfLocation).toString().split("\n");
                data.splice(repoline, 0, await ParseUsers([{ username: username, perms: perms }]));
                var text = data.join("\n");
                fs.writeFile(GitoliteConfLocation, text, function (err) {
                    if (err) return console.log(err);
                });
                return 'added new user to repo with sucess';
            }
            else {
                return false
            }
        }
        else {
            return null
        }

    }
    else {
        let resp = await CheckIfRepoAlreadyExistsWithLineNumber(reponame, GitoliteConfLocation);
        if (Number.isInteger(resp) === true) {
            return await CheckIfUserAlreadyExistsInRepo(reponame, resp, username, GitoliteConfLocation)
        }
        else {
            return null
        }
    }
}

// checks if the gitolite file contains repo already
async function CheckIfFileContainsRepo(reponame, GitoliteConfLocation) {
    let value1 = null;
    await CheckIfFileContainsRepoPromise(GitoliteConfLocation, reponame).then(function (value) {
        value1 = value
    }).catch(function (err) {
        console.error(err);
    });
    if (value1 == true) {
        return (true)
    } else {
        return (false)
    }
}// The promise var for the above function 
var CheckIfFileContainsRepoPromise = function (filelocation, reponame) {
    let linenumber = 1
    return new Promise(function (resolve, reject) {
        lineReader.eachLine(filelocation, async function (line, last, cb) {
            if (line.trim().includes('repo') == true) {
                line = line.replace('repo', '').trim()
                if (reponame === line) {
                    resolve(true);
                    cb(false)
                }
                else {
                    cb();
                }
            }
            else {
                cb();
            }
            if (last == true) {
                resolve(false)
            }
            linenumber = linenumber + 1;
        })
    })
}

//checks if the gitolite file has the repo and returns the line number of repo
async function CheckIfRepoAlreadyExistsWithLineNumber(reponame, GitoliteConfLocation) {
    let value1 = null;
    await CheckIfFileContainsRepoPromiseWithLineNumber(GitoliteConfLocation, reponame).then(function (value) {
        value1 = value
    }).catch(function (err) {
        console.error("CheckIfRepoAlreadyExistsWithLineNumber", err);
    });
    if (Number.isInteger(value1) == true) {
        return (value1)
    } else {
        return (false)
    }
}// The promise var for the above function 
var CheckIfFileContainsRepoPromiseWithLineNumber = function (filelocation, reponame) {
    let linenumber = 1
    return new Promise(function (resolve, reject) {
        lineReader.eachLine(filelocation, async function (line, last, cb) {
            if (line.trim().includes('repo') == true) {
                line = line.replace('repo', '').trim()
                if (reponame === line) {
                    resolve(linenumber);
                    cb(false)
                }
                else {
                    cb();
                }
            }
            else {
                cb();
            }
            if (last == true) {
                resolve(false)
            }
            linenumber = linenumber + 1;
        })
    })
}


//export models
module.exports = { AddGitoliteRepoWithUser, RemoveGitoliteRepo, AddGitoliteUser, AddUsersToExistingGitoliteRepo, RemoveGitoliteUser, RemoveUserInGitoliteRepo, ChangeUserPermsInGitoliteRepo }