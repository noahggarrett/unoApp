import { GameMode } from './../_models/enums';
import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { User } from '../_models/user';
import { TypeOfMessage } from '../_models/enums';
import { ChatMessage } from '../_models/chatMessage';
import { Game } from '../_models/game';

@Injectable({
  providedIn: 'root'
})
export class HubService {
  private _hubConnection: signalR.HubConnection;
  private _allChatMessages: ChatMessage[] = [];
  private _gameChatMessages: ChatMessage[] = [];
  private _buzzPlayerDisabled: boolean;

  private _onlineUsersObservable = new BehaviorSubject<User[]>(new Array<User>());
  private _currentUserObservable = new BehaviorSubject<User>(null);
  private _allChatMessagesObservable = new BehaviorSubject<ChatMessage[]>(this._allChatMessages);
  private _availableGamesObservable = new BehaviorSubject<Game[]>(new Array<Game>());
  private _activeGameObservable = new BehaviorSubject<Game>(null);
  private _gameChatMessagesObservable = new BehaviorSubject<ChatMessage[]>(this._gameChatMessages);

  constructor(private _router: Router) {
    this._hubConnection = new signalR.HubConnectionBuilder().withUrl('/gamehub').build();
    this._hubConnection.start().then(() => {
      this.rename(false);
    });

    this._hubConnection.on('RefreshOnlineUsersList', (onlineUsers: User[]) => {
      this._onlineUsersObservable.next(onlineUsers);
    });

    this._hubConnection.on('UpdateCurrentUser', (user: User) => {
      this._currentUserObservable.next(user);
    });

    this._hubConnection.on('RenamePlayer', () => {
      this.rename(true);
    });

    this._hubConnection.on('PostNewMessageInAllChat', (message: ChatMessage) => {
      this._allChatMessages.unshift(message);
      this._allChatMessagesObservable.next(this._allChatMessages);
    });

    this._hubConnection.on('PostNewMessageInGameChat', (message: ChatMessage) => {
      this._gameChatMessages.unshift(message);
      this._gameChatMessagesObservable.next(this._gameChatMessages);
    });

    this._hubConnection.on('RefreshAllGamesList', (games: Game[]) => {
      this._availableGamesObservable.next(games);
    });

    this._hubConnection.on('BuzzPlayer', () => {
      if (this._buzzPlayerDisabled) {
        return;
      }
      this._buzzPlayerDisabled = true;
      const alert = new Audio('/sounds/alert.mp3');
      alert.load();
      alert.play();
      setTimeout(() => {
        this._buzzPlayerDisabled = false;
      }, 5000);
    });

    this._hubConnection.on('KickPlayerFromGame', () => {
      this._activeGameObservable.next(null);
      this._router.navigateByUrl('home');
    });

    this._hubConnection.on('DisplayToastMessage', (message: string) => {
      alert(message);
    });

    this._hubConnection.on('UpdateGame', (game: Game) => {
      this._activeGameObservable.next(game);
      if (game.gameStarted) {
        if (this._router.url !== '/game') {
          this._router.navigateByUrl('/game');
        }
      } else {
        if (this._router.url !== '/waitingRoom') {
          this._router.navigateByUrl('/waitingRoom');
        }
      }
    });
  }

  sendMessageToAllChat(message: string): any {
    this._hubConnection.invoke('SendMessageToAllChat', this._currentUserObservable.getValue().name, message, TypeOfMessage.chat);
  }

  rename(forceRename: boolean) {
    let name;
    if (environment.production) {
      do {
        if (forceRename) {
          name = prompt('Input your name');
        } else {
          name = localStorage.getItem('name') || prompt('Input your name');
        }
      } while (!name);
    } else {
      const myArray = ['Ante', 'Mate', 'Jure', 'Ivica', 'John'];
      name = myArray[Math.floor(Math.random() * myArray.length)];
    }
    localStorage.setItem('name', name);
    this._hubConnection.invoke('AddOrRenameUser', name);
    this._hubConnection.invoke('GetAllGames');
  }

  joinGame(id: string, password: string): any {
    this._hubConnection.invoke('JoinGame', id, password);
  }

  sendMessageToGameChat(message: string): any {
    this._hubConnection.invoke(
      'SendMessageToGameChat',
      this._activeGameObservable.getValue().gameSetup.id,
      this._currentUserObservable.getValue().name,
      message,
      TypeOfMessage.chat
    );
  }

  createGame(gameMode: GameMode) {
    this._hubConnection.invoke('CreateGame', gameMode);
  }

  kickPlayerFromGame(user: User): any {
    this._hubConnection.invoke('KickPlayerFromGame', user.name, this._activeGameObservable.getValue().gameSetup.id);
  }

  exitGame(): any {
    if (!this._activeGameObservable.getValue()) {
      return;
    }
    this._hubConnection.invoke('ExitGame', this._activeGameObservable.getValue().gameSetup.id);
    this._activeGameObservable.next(null);
  }

  startGame(): any {
    this._hubConnection.invoke('StartGame', this._activeGameObservable.getValue().gameSetup.id);
  }

  setGamePassword(id: string, roomPassword: string): any {
    this._hubConnection.invoke('SetGamePassword', id, roomPassword);
  }

  get onlineUsers() {
    return this._onlineUsersObservable.asObservable();
  }

  get currentUser() {
    return this._currentUserObservable.asObservable();
  }

  get allChatMessages() {
    return this._allChatMessagesObservable.asObservable();
  }

  get availableGames() {
    return this._availableGamesObservable.asObservable();
  }

  get activeGame() {
    return this._activeGameObservable.asObservable();
  }

  get gameChatMessages() {
    return this._gameChatMessagesObservable.asObservable();
  }
}
