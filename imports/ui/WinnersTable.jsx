import React, { Component } from 'react';
import { Table } from 'react-bootstrap';

class WinnersTable extends Component {
    constructor(prop) {
        super();
    }

    renderAdditionalWinners(winners) {
        const { adult } = this.props;
        return winners.map((author) => {
            const position = winners.indexOf(author) + 4;
            // Only render top 10 results.
            if (position > 10) return '';

            return (
                <tr key={author.id}>
                    <td className="number">
                        {position}
                    </td>
                    <td className="name authorname">
                        {author.nsfw && !adult
                        ? <span><img className="user-image user-image-table" src='https://www.nexusmods.com/Contents/Images/noimage.svg'/><i>NSFW Content</i></span>
                        : <a href={author.url} target="_blank"><img className="user-image user-image-table" src={author.image}/>{author.name}</a>}
                    </td>
                        {author.game ? <td>{author.game}</td> : undefined}
                    <td className="number">
                        {author.votes}
                    </td>
                </tr>
            );
        });
    }

    render() {
        const { adult, tableItemName, entries, imageClass, imageContClass } = this.props;

        const allRows = entries.slice(3, entries.length);
        const top3 = entries.slice(0,3);

        return (
        <div className="winners-table-container">
            <Table className="winners-table">
                <thead>
                    <tr>
                        <th className="second">
                            {top3[1] && top3[1].nsfw && !adult 
                            ?
                            <span>
                            <div className={imageContClass}><img className={imageClass} src='https://www.nexusmods.com/Contents/Images/noimage.svg' /></div>
                            <div><a><i>NSFW Content</i></a></div>
                            </span>
                            :
                            <span>
                            <div className={imageContClass}><img className={imageClass} src={top3[1] ? top3[1].image : 'https://www.nexusmods.com/Contents/Images/noimage.svg'} /></div>
                            <div>{top3[1] ? <a href={top3[1].url}>{top3[1].name}</a> : '???'}</div>
                            </span>
                            }
                            {top3[1] && top3[1].game ? <div>{top3[1].game}</div> : ''}
                            <div>🥈 2nd Place</div>
                            <div>{top3[1] ? top3[1].votes : 'No'} votes</div>
                        </th>
                        <th className="first">
                            {top3[0] && top3[0].nsfw && !adult 
                            ?
                            <span>
                            <div className={imageContClass}><img className={imageClass} src='https://www.nexusmods.com/Contents/Images/noimage.svg' /></div>
                            <div><a><i>NSFW Content</i></a></div>
                            </span>
                            :
                            <span>
                            <div className={imageContClass}><img className={imageClass} src={top3[0] ? top3[0].image : 'https://www.nexusmods.com/Contents/Images/noimage.svg'} /></div>
                            <div>{top3[0] ? <a href={top3[0].url}>{top3[0].name}</a> : '???'}</div>
                            </span>
                            }
                            {top3[0] && top3[0].game ? <div>{top3[0].game}</div> : ''}
                            <div>🥇 1st Place</div>
                            <div>{top3[0] ? top3[0].votes : 'No'} votes</div>
                        </th>
                        <th className="third">
                            {top3[2] && top3[2].nsfw && !adult 
                            ?
                            <span>
                            <div className={imageContClass}><img className={imageClass} src='https://www.nexusmods.com/Contents/Images/noimage.svg' /></div>
                            <div><a><i>NSFW Content</i></a></div>
                            </span>
                            :
                            <span>
                            <div className={imageContClass}><img className={imageClass} src={top3[2] ? top3[2].image : 'https://www.nexusmods.com/Contents/Images/noimage.svg'} /></div>
                            <div>{top3[2] ? <a href={top3[2].url}>{top3[2].name}</a> : '???'}</div>
                            </span>
                            }
                            {top3[2] && top3[2].game ? <div>{top3[2].game}</div> : ''}
                            <div>🥉 3rd Place</div>
                            <div>{top3[2] ? top3[2].votes : 'No'} votes</div>
                        </th>
                    </tr>
                </thead>
            </Table>

            {allRows.length ?
            <Table>
                <thead>
                    <tr>
                        <th colSpan="4"><h3>Additional Entries</h3></th>
                    </tr>
                    <tr>
                        <th className="number">#</th>
                        <th>{tableItemName}</th>
                        {allRows[0].game ? <th>Game</th> : undefined}
                        <th className="number">Votes</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderAdditionalWinners(allRows)}
                </tbody>
            </Table>
            : ''}

        </div>
        );
    }
}

export default WinnersTable;