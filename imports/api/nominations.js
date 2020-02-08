import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import requestPromise from 'request-promise-native';

export const Nominations = new Mongo.Collection('nominations');

if (Meteor.isServer) {
    Meteor.publish('nominations', function nominationsPublication () {
        return Nominations.find({ owner: parseInt(this.userId) });
    });
    Meteor.publish('allnominations', function allnominationsPublication () {
        return Nominations.find({}, { fields: { owner: 0 } });
    })
}

Meteor.methods({
    addNomination: async function (userId, author) {
        check(userId, Number);
        check(author, Object);

        if (userId === author.member_id) throw new Meteor.Error('voted-self');

        const authorNominations = Nominations.find({owner: userId}).fetch();
        if (authorNominations.length >= 10) throw new Meteor.Error('maximum-votes');
        const currentVote = authorNominations.find(n => n.authorId === author.member_id);
        if (currentVote) throw new Meteor.Error('already-voted');

        author.avatar ? undefined : author.avatar = await getAvatar(author.member_id);

        Nominations.insert({
            owner: userId,
            authorId: author.member_id,
            name: author.name,
            avatar: author.avatar,
            createdAt: new Date(),
        });
    },
    removeNomination: function (id) {
        check(id, String);
        
        Nominations.remove(id);
    },
    getAvatar: async function (authorId) {
        return getAvatar(authorId);        
    }
})

const fileExt = ['.jpg', '.gif', '.png', '.jpeg'];

async function getAvatar(member_id) {

    const existingAuthor = Nominations.find({authorId: member_id}).fetch();
    if (existingAuthor){ 
        const avatar = existingAuthor.filter(v => v.avatar)[0];
        // console.log('existing avatar', avatar ? avatar.avatar: 'none'); 
        if (avatar) return avatar.avatar; 
    };

    let avatarURL;

    for (i = 0; !avatarURL; i++) {
        if (i >= fileExt.length) {
            avatarURL = `https://www.nexusmods.com/Contents/Images/noavatar.gif`
            break;
        };
        const url = `https://forums.nexusmods.com/uploads/profile/photo-thumb-${member_id}${fileExt[i]}`;
        try {
            await requestPromise({url: url});
            avatarURL = url;
        }
        catch(err) {
            // Error, usually 404.
        }
    }
    return avatarURL;
}