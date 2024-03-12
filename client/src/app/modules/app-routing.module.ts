import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasswordPromptComponent } from '@app/components/password-prompt/password-prompt.component';
import { authGuardAuthentification } from '@app/guard/auth.guard/auth.guard';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { GameAdministrationPageComponent } from '@app/pages/game-administration-page/game-administration-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { QuizCreationPageComponent } from '@app/pages/quiz-creation-page/quiz-creation-page.component';
import { WaitingRoomPlayerPageComponent } from '@app/pages/waiting-room-player-page/waiting-room-player-page.component';
import { WaitingRoomHostPageComponent } from '@app/pages/waiting-room-host-page/waiting-room-host-page.component';

const routes: Routes = [
    { path: '', component: MainPageComponent },
    { path: 'home', component: MainPageComponent },
    { path: 'game/:id', component: GamePageComponent },
    { path: 'game-creation-page', component: GameCreationPageComponent },
    { path: 'quiz-creation', component: QuizCreationPageComponent, canActivate: [authGuardAuthentification] },
    { path: 'quiz-creation/:id', component: QuizCreationPageComponent, canActivate: [authGuardAuthentification] },
    { path: 'game-admin-prompt', component: PasswordPromptComponent },
    { path: 'quiz-testing-page/:id', component: GamePageComponent },
    { path: 'waiting-room-host-page/:id', component: WaitingRoomHostPageComponent },
    { path: 'waiting-room-player-page', component: WaitingRoomPlayerPageComponent },
    { path: 'game-admin-page', component: GameAdministrationPageComponent, canActivate: [authGuardAuthentification] },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
