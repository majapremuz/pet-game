import {IonicModule } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-game-over',
  templateUrl: './game-over.page.html',
  styleUrls: ['./game-over.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class GameOverPage implements OnInit {

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
  }

  restartGame() {
    this.userService.resetGameState();
    this.router.navigate(['/game']).then(() => {
      console.log('Game restarted');
    });
  }

}
