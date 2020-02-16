import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';

class ModInfo extends Component {

    constructor(props) {
        super();
        this.state = {alert: null, avatar: null};
    }
    
    toggleVote() {
        const { votes, mod, user, game } = this.props;
        const currentVote = votes.find(v => v.gameId === game.id && v.modId === mod.mod_id);

        if (currentVote) {
            // Remove the vote
            Meteor.call('removeVote', currentVote._id, (err, result) => {
                if (err) this.setAlert({error: true, message: `Error in handling your vote: ${err.error}.`});
                else return this.setAlert({error: false, message: `Your vote has been removed!`})
            });
        }
        else {
            Meteor.call('addVote', user.user_id, game, mod, (err, result) => {
                if (err) {
                    if (err.error === "maximum-votes") return this.setAlert({error: true, message: `You have already voted for the maximum (5) number of mods from ${game.name}.`});
                    if (err.error === "already-voted") return this.setAlert({error: true, message:`You have already voted for ${mod.name}`});
                    if (err.error === "voted-self") return this.setAlert({error: true, message: `You cannot vote for yourself!`});
                    else return this.setAlert({error: true, message: `Error in handling your vote: ${err.error}.`});
                }
                if (result) return this.setAlert({error: false, message: `Your vote has been recorded!`});
            });
        }
    }

    toggleNomination() {
        const { user, mod, nominations } = this.props;
        const { avatar } = this.state;
        const alreadyNominated = nominations.find(n => n.authorId === mod.user.member_id);
        
        if (alreadyNominated) {
            // Remove nomination
            Meteor.call('removeNomination', alreadyNominated._id, (err, result) => {
                if (err) return this.setAlert({error: true, message: `Error in handling your nomination: ${err.error}.`});
                return this.setAlert({error: false, message: `You are no longer nominating ${mod.user.name} for Mod Author of the Year!`});
            });
        }
        else {
            // Nominate
            mod.user.avatar = avatar;
            Meteor.call('addNomination', user.user_id, mod.user, (err, result) => {
                if (err) {
                    if (err.error === "already-voted") return this.setAlert({error: true, message: `You have already voted for ${mod.user.name}.`});
                    if (err.error === "voted-self") return this.setAlert({error: true, message: `You cannot vote for yourself!`});
                    else return this.setAlert({error: true, message: `Error in handling your nomination: ${err.error}.`});
                }
                return this.setAlert({error: false, message: `You have nominated ${mod.user.name} for Mod Author of the Year!`});
            });
        }
    }

    setAlert(newAlert) {
        this.setState({alert: newAlert});
    }

    componentDidUpdate() {
        if (this.state.alert) setTimeout(() => this.setState({alert: null}), 5000);
    }

    getAuthorAvatar(id) {
        Meteor.call('getAvatar', id, (error, result) => {
            if (error) {
                console.log('Error fetching avatar', error);
                return '';
            }
            return this.setState({avatar: result});
        })
    }

    toggleEndorse() {
        const { user, game, mod } = this.props;
        let endorsements = [...user.endorsements];
        const currentEndorsement = endorsements ? endorsements.find(e => e.domain_name === game.domain_name && e.mod_id === mod.mod_id) : undefined;
        const newState = currentEndorsement && currentEndorsement.status === "Endorsed" ? "abstain" : "endorse";
        Meteor.call('endorseMod', user.key, mod.mod_id, mod.version, newState, game.domain_name, (error, result) => {
            if (error) {
                if (error.error === "NOT_DOWNLOADED_MOD") return this.setState({ alert:{ error: true, message: "You have not downloaded this mod, so you cannot endorse it." } })
                if (error.error === "TOO_SOON_AFTER_DOWNLOAD") return this.setState({ alert: { error: true, message: "You must wait at least 15 minutes to endorse this mod." } });
                else return this.setState( { alert: { error: true, message: `Error when attempting to toggle endorsement: ${error.error}`} } )
            };

            if (currentEndorsement) currentEndorsement.status = newState === "endorse" ? "Endorsed" : "Abstained"; 
            else endorsements.push({ date: new Date(), domain_name: game.domain_name, mod_id: mod.mod_id, status: newState === "endorse" ? "Endorsed" : "Abstained", version: mod.version });

            this.props.setLocalEndorsement(endorsements);

            return this.setState({ alert: { error: false, message: newState === "endorse" ? `You have successfully endorsed ${mod.name}.` : `You are no longer endorsing ${mod.name}.` } });
        });
    }
    
    render() {
        const { user, game, mod, votes, nominations } = this.props;
        if (!this.state.avatar) this.getAuthorAvatar(mod.user.member_id);
        const alreadyVoted = votes.find(v => v.gameId === mod.game_id && v.modId === mod.mod_id) ? true : false;
        const alreadyNominated = nominations.find(n => n.authorId === mod.user.member_id) ? true : false;
        const remainingVotes = (5 - votes.filter(v => v.gameId === mod.game_id).length);
        const remainingNominations = (10 - nominations.length);
        const gameName = game ? game.name : 'this game';
        const endorsement = game && user.endorsements ? user.endorsements.find(e => e.domain_name === game.domain_name && e.mod_id === mod.mod_id) : undefined;
        const currentlyEndorsed = endorsement && endorsement.status === "Endorsed" ? true : false;

        return (
            <div>
            {this.state.alert ? <div className={`vote-alert ${this.state.alert.error ? 'vote-alert-error' : ''}`}>{this.state.alert.message}</div> : ''}
            <button className="modinfo-cancel" onClick={() => this.props.setActiveMod(null)}>❌</button>
            <h2>{mod.name}</h2>
            <div className="modinfo-row">
                <div className="modinfo-column">
                    <img src={mod.picture_url} />
                    <div>{mod.summary}</div>
                    <button className={`modinfo-btn ${alreadyVoted ? 'modinfo-btn-active' : ''}`} onClick={this.toggleVote.bind(this)}>🏆 {alreadyVoted? 'Voted' : 'Vote'}</button>
                    <button className={`modinfo-btn ${currentlyEndorsed ? 'modinfo-btn-active' : ''}`} disabled={!user.endorsements} onClick={this.toggleEndorse.bind(this)}>👍 {currentlyEndorsed ? 'Endorsed' : 'Endorse'}</button>
                    <button className="modinfo-btn" onClick={() => window.open(`https://nexusmods.com/${mod.domain_name}/mods/${mod.mod_id}`, '_blank')}>🌐 Visit</button>
                    <p>You have {remainingVotes} votes remaining for {gameName}.</p>
                </div>
                <div className="modinfo-column modinfo-column-author">
                    <h2>Author</h2>
                    <div className="user-image user-image-inline" style={{backgroundImage: `url(${this.state.avatar})`}}></div>
                    <a href={`https://nexusmods.com/users/${mod.user.member_id}`}>{mod.user.name}</a>
                    <p>If you enjoy {mod.user.name}'s work, you can nominate them for Mod Author of the Year by clicking the button below.</p>
                    <p>You have {remainingNominations} nominations remaining.</p>
                    <button className={`modinfo-btn ${alreadyNominated ? 'modinfo-btn-active' : ''}`} onClick={this.toggleNomination.bind(this)}>🏆 {alreadyNominated ? 'Nominated' : 'Nominate'} {mod.user.name}</button>
                </div>
            </div>
            </div>
        );
    }
}

export default ModInfo;