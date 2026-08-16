import { createRouter, createWebHashHistory } from 'vue-router'
import TodayView from './views/TodayView.vue'
import SessionView from './views/SessionView.vue'
import CurriculumView from './views/CurriculumView.vue'
import CheatsheetsView from './views/CheatsheetsView.vue'
import HabitsView from './views/HabitsView.vue'
import SettingsView from './views/SettingsView.vue'
import QaView from './views/QaView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'today', component: TodayView },
    { path: '/session/:id', name: 'session', component: SessionView, props: true },
    { path: '/curriculum', name: 'curriculum', component: CurriculumView },
    { path: '/cheatsheets', name: 'cheatsheets', component: CheatsheetsView },
    { path: '/qa', name: 'qa', component: QaView },
    { path: '/habits', name: 'habits', component: HabitsView },
    { path: '/settings', name: 'settings', component: SettingsView },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
