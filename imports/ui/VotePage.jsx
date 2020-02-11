import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import Select from "react-dropdown-select"; 

import ModInfo from './ModInfo';

class VotePage extends Component {
    constructor(props) {
        super();

        this.state = {
            activeGames: [],
            activeMod: null,
            searchQuery: '',
            searchResults: null,
        }

        this.typingTimeout = null;
    }


    handleSearchChange(event) {
        event.preventDefault();

        this.setState({searchQuery: event.target.value}, () => {
            if (this.typingTimeout) clearTimeout(this.typingTimeout)
            this.typingTimeout = setTimeout(() => {
                if(this.state.searchQuery) this.search();
                else this.setState({searchResults: null});
            }, 500);
        });
    }

    async search() {
        const { activeGames, searchQuery } = this.state;
        const { user, games, gamesLoading, showAdult } = this.props;
        const gameId = activeGames && activeGames.length === 1 ? activeGames[0].id : -1;

        if (searchQuery.length < 2) return;

        Meteor.call('searchMods', gameId, searchQuery, showAdult, (error, result) => {
            if (error) return alert(error);
            this.setState({searchResults: result});
        })
        user && !gamesLoading && !games.length ? this.props.getGames() : undefined;
    }

    renderResults() {
        const { activeGames, searchResults } = this.state;
        const { games } = this.props;

        const results = searchResults.results ? searchResults.results.map(s => {
            if (activeGames.length && !activeGames.find(g => g.domain_name === s.game_name)) return '';
            return (
            <div className="search-result" onClick={() => this.setActiveMod(s)} key={searchResults.results.indexOf(s)} style={{backgroundImage: s.image ? `linear-gradient(to right, #1f1f1f 75%, transparent), url(http://staticdelivery.nexusmods.com${s.image})` : ''}}>
                <div><a>{s.name.replace(/&#39;/g, '\'')}</a> {games.length && (!activeGames || activeGames.length !== 1) ? `(${games.find(g => g.domain_name === s.game_name).name})` : ''}</div>
                <div><i>By {s.username}</i></div>
            </div>
            );
        }) : '';

        return (
            <div>
            <div className="search-info">Displaying <b>{results.filter(r => r !== '').length}</b> of <b>{searchResults.total}</b> results for "{searchResults.terms.join(" ")}". Adult content is {searchResults.include_adult ? 'included' : 'blocked'}.</div>
            {results.length ? results : <p>No mods found.</p>}
            <div className="search-info"><i>Search completed in: {searchResults.took}ms</i></div>
            </div>
        );
    }

    setActiveMod(mod) {
        const { user } = this.props;
        if (!user) return alert('Please log in to vote.');

        if (mod) {
            Meteor.call('getModInfo', user.key, mod.game_name, mod.mod_id, (error, result) => {
                if (error) return alert(error);
                this.setState({activeMod: result});
            });
        }
        else this.setState({activeMod: null});
    }

    setActiveGames(values) {
        const length = this.state.activeGames.length;
        this.setState({activeGames: values}, () => {
            if (length === 1) this.search(this);
        });
    }

    searchOnEnter(event) {
        if (event.key === "Enter") this.search();
    }

    componentDidUpdate(prevProps) {
        const { user, gamesLoading, games, showAdult } = this.props;
        if ((prevProps.showAdult !== showAdult) && this.state.searchQuery) this.search(this);
    }

    componentDidMount() {
        const { user, games, gamesLoading } = this.props;
        user && !gamesLoading && !games.length ? this.props.getGames() : undefined;
    }

    render() {
        const { user, votes, nominations, showAdult, games, gamesLoading } = this.props;
        const { activeGames, activeMod, searchResults, searchQuery } = this.state;

        return (
            <div className="vote-page" style={{backgroundImage: activeGames.length ? `linear-gradient(to left, rgb(76,76,76) 60%, transparent), linear-gradient(to top, rgb(76,76,76) 20%, transparent), url(https://staticdelivery.nexusmods.com/Images/games/4_3/tile_${activeGames[0].id}.jpg)` : ''}}>
                {!activeMod ?
                <div>
                    <h2>Vote for your favourite mods!</h2>
                <div className="search-box">
                    <input className="search-text" type="text" value={searchQuery} placeholder="Search for a mod..." onChange={this.handleSearchChange.bind(this)} onKeyPress={this.searchOnEnter.bind(this)} />
                    <input className="search-btn" type="submit" value="Search" disabled={!searchQuery} onClick={this.search.bind(this)} />
                </div>
                <Select 
                    className="game-selector"
                    options={games}
                    disabled={!!user ? false : true || !games.length}
                    loading={gamesLoading}
                    onChange={(values) => this.setActiveGames(values)}
                    placeholder={!!user ? 'Filter by game' : 'Log in to select a game'}
                    labelField='name'
                    valueField='name'
                    color='#da8e35'
                    multi={true}
                    clearable={true}
                    closeOnSelect={true}
                    onClick={user & !games.length ? this.props.getGames() : undefined}
                /> <label><input type="checkbox" checked={showAdult} onChange={this.props.toggleNSFW} />Show Adult Content</label>
                {searchResults ? this.renderResults() : ''}
                </div>
                : <ModInfo 
                    user={user}
                    mod={activeMod} 
                    setActiveMod={this.setActiveMod.bind(this)} 
                    votes={votes} user={user} 
                    game={games.find(g => g.id === activeMod.game_id)} 
                    nominations={nominations}
                    setLocalEndorsement={this.props.setLocalEndorsement}
                />}
            </div>
        )
    }
}

export default VotePage;