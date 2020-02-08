import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const ModVotes = new Mongo.Collection('modvotes');

if (Meteor.isServer) {
    Meteor.publish('modvotes', function modVotesPublication () {
        return this.userId ? ModVotes.find({ owner: parseInt(this.userId) }) : [];
    });
    Meteor.publish('allvotes', function allvotesPublication () {
        return ModVotes.find({}, { fields: { owner: 0 } });
    })
}

Meteor.methods({
    addVote: function (userId, game, mod) {
        check(userId, Number);
        check(game, Object);
        check(mod, Object);

        if (userId === mod.user.member_id) throw new Meteor.Error('voted-self');

        const gameVotes = ModVotes.find({owner: userId, gameId: game.id}).fetch();
        if (gameVotes.length >= 5) throw new Meteor.Error('maximum-votes');
        const currentVote = gameVotes.find(v => v.modId === mod.mod_id);
        if (currentVote) throw new Meteor.Error('already-voted');

        ModVotes.insert({
            owner: userId,
            gameId: game.id,
            gameDomain: game.domain_name,
            gameTitle: game.name,
            modId: mod.mod_id,
            modName: mod.name,
            modImage: mod.picture_url,
            nsfw: mod.contains_adult_content,
            createdAt: new Date()
        });

        return gameVotes+1;
    },
    removeVote: function (voteId) {
        check(voteId, String);
        ModVotes.remove(voteId);
    }
})