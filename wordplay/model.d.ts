/// <reference path="../meteor.d.ts"/>

interface GamesDAO {
	board: Array<string>;
	clock:number;
	winners: Array<number>;

}

declare var Games:Meteor.Collection<GamesDAO>;

interface WordsDAO {
	player_id:number;
	game_id:number;
	word:string;
	state:string;
	players: Array<PlayersDAO>;
	score:number;
}

declare var Words:Meteor.Collection<WordsDAO>;

interface PlayersDAO {
	name:string;
	player_id?:number;
	idle:boolean;
}

declare var Players:Meteor.Collection<PlayersDAO>;

declare var new_board:Function;
declare var paths_for_word:Function;