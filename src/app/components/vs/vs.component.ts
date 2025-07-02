/*import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-vs',
  templateUrl: './vs.component.html',
  styleUrls: ['./vs.component.scss'],
})
export class VSComponent  implements OnInit {

  constructor(
    private userService: UserService,
    private http: HttpClient
  ) { }

  selectedChallenge: 'smart' | 'speed' | 'strength' = 'smart';
opponents: Pet[] = [];
selectedOpponent: Pet | null = null;

ngOnInit() {
  const player = this.userService.getSelectedPet();
  this.http.get<Pet[]>('http://localhost:3000/pets').subscribe(allPets => {
    this.opponents = allPets
      .filter(p => p.id !== player.id && this.totalStat(p) > this.totalStat(player));
  });
}

totalStat(pet: Pet): number {
  return pet.smart + pet.speed + pet.strength;
}

selectOpponent(pet: Pet) {
  this.selectedOpponent = pet;
}

startVS() {
  const player = this.userService.getSelectedPet();
  this.http.post('http://localhost:3000/vs', {
    challenger: player,
    opponent: this.selectedOpponent,
    stat: this.selectedChallenge
  }).subscribe(result => {
    this.handleVSResult(result);
  });
}

handleVSResult(result: { winner: string, points: number }) {
  if (result.winner === 'challenger') {
    this.userService.addPoints(result.points);
    this.showAlert('You won!', `You gained ${result.points} points.`);
  } else if (result.winner === 'opponent') {
    this.userService.removePoints(result.points);
    this.showAlert('You lost!', `You lost ${result.points} points.`);
  } else {
    this.showAlert('It\'s a draw!', 'No points awarded.');
  }

  // Save result so user can't play again today
  this.userService.setLastVSDate(new Date());
}

canPlayVS(): boolean {
  const last = this.userService.getLastVSDate();
  const now = new Date();
  return !last || new Date(last).toDateString() !== now.toDateString();
}

}
*/
