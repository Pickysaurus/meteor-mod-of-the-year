import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Nexus from '@nexusmods/nexus-api';
import requestPromise from 'request-promise-native';


const nexusSearchAPI ="https://search.nexusmods.com/mods"; //for quicksearching mods

let NexusModsClient;

if (Meteor.isServer) {

    Meteor.methods({
      validateAPIkey: async function (apiKey) {
        check(apiKey, String);
        try {
          !NexusModsClient ? await configureNexusClient(apiKey).catch((err) => {console.log('config error')}) : undefined;
          const validateReply = await NexusModsClient.validateKey(apiKey);
          // Set login state for Meteor. 
          if (!this.userId) this.setUserId(validateReply.user_id.toString());
          return validateReply;
        }
        catch(err) {
          console.error(err);
          throw new Meteor.Error('Error validating API key'+err);
        }
  
      },
      logout: function () {
        this.setUserId(null);
      },
      getGames: async function (apiKey) {
        check(apiKey, String);
        
        try {
          await configureNexusClient(apiKey);
          const gameList = NexusModsClient.getGames();
          return gameList;
        } 
        catch(err) {
          console.error(err);
          throw new Meteor.Error('Error getting games', err);
        }     
      },
      searchMods: async function (gameId, query, bAdult) {
        check(query, String);
        check(gameId, Number);
        check(bAdult, Boolean)
        const sanitisedQuery = query.replace(/('s)/gi, '').replace(/[^\w\s]/gi, '').split(" ").join(",");
        const qs = {
            terms: encodeURI(sanitisedQuery),
            include_adult: bAdult,
        }
        if (gameId !== -1) qs.game_id = gameId;

        try {
          const results = await requestPromise({url: nexusSearchAPI, qs: qs, timeout: 15000});
          return JSON.parse(results);
        }
        catch(err) {
          console.log(err);
          return [];
        }      
      },
      getModInfo: async function (apiKey, gameDomain, modId) {
        check(apiKey, String);
        check(gameDomain, String);
        check(modId, Number);
  
        try {
          await configureNexusClient(apiKey);
          let modInfo = await NexusModsClient.getModInfo(modId, gameDomain);
          let modFiles = await NexusModsClient.getModFiles(modId, gameDomain);
          modInfo.files = modFiles.files.filter(f => f.category_name);
          modInfo.fileUpdates = modFiles.file_updates;
          return modInfo;
        }
        catch(err) {
          console.error(err);
          throw new Meteor.Error('Error getting mod info', err);
        }
      },
      getDownloadURLs: async function (apiKey, gameId, modId, fileId) {
        check(apiKey, String);
        check(gameId, String);
        check(modId, Number);
        check(fileId, Number);
  
        try {
          await configureNexusClient(apiKey);
          const downloadURLs = await NexusModsClient.getDownloadURLs(modId, fileId, gameId);
          return downloadURLs;
        }
        catch(err) {
          console.error(err);
          throw new Meteor.Error('Error getting download links.', err);
        }
  
  
      }
    })
  }
  
  async function configureNexusClient(apiKey) {
    if (!NexusModsClient) {
      try {
         NexusModsClient = await Nexus.create(apiKey, 'Mod Data Site', '1.0.0', 'skyrim');
      }
      catch(err) {
        console.error(err);
        return false;
      }
    }
    else {
      await NexusModsClient.setKey(apiKey);
      return true;
    }
  }