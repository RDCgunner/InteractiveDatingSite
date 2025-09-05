import { Routes } from '@angular/router';
import { Home } from '../features/home/home';
import { MemberList } from '../features/members/member-list/member-list';
import { MemberDetailed } from '../features/members/member-detailed/member-detailed';
import { Lists } from '../features/lists/lists';
import { Messages } from '../features/messages/messages';
import { authGuard } from '../core/guards/auth-guard';
import { TestErrors } from '../features/test-errors/test-errors';
import { NotFound } from '../shared/errors/not-found/not-found';
import { ServerError } from '../shared/errors/server-error/server-error';
import { MemberProfile } from '../features/members/member-profile/member-profile';
import { MemberMessages } from '../features/members/member-messages/member-messages';
import { MemberPhotos } from '../features/members/member-photos/member-photos';
import { memberResolver } from '../features/members/member-resolver';

export const routes: Routes = [
  { path: 'errors', component: TestErrors },
  { path: 'server-error',component:ServerError},
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home},
      { path: 'members', component: MemberList, pathMatch:'full'},
      { path: 'members/:id', 
          resolve:{memberF: memberResolver},
          runGuardsAndResolvers:'always',
          component: MemberDetailed,
          children:[
            {path: '', redirectTo:'profile', pathMatch:'full'},
            {path: 'profile', component: MemberProfile, title:'Profile'},
            {path: 'messages', component: MemberMessages, title:'Messages'},
            {path: 'photos', component: MemberPhotos, title:'Photos'},
          ]
       },
      { path: 'lists', component: Lists },
      { path: 'messages', component: Messages },
    ],
  },
  { path: '**', component: NotFound },
];
