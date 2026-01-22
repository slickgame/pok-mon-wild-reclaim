import Battle from './pages/Battle';
import Contests from './pages/Contests';
import Crafting from './pages/Crafting';
import Endgame from './pages/Endgame';
import Fishing from './pages/Fishing';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import MaplesLab from './pages/MaplesLab';
import NPCs from './pages/NPCs';
import Onboarding from './pages/Onboarding';
import Pokemon from './pages/Pokemon';
import SetBuilder from './pages/SetBuilder';
import StartScreen from './pages/StartScreen';
import StoryCutscene from './pages/StoryCutscene';
import TutorialLog from './pages/TutorialLog';
import Zones from './pages/Zones';
import Storage from './pages/Storage';
import Pokedex from './pages/Pokedex';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Battle": Battle,
    "Contests": Contests,
    "Crafting": Crafting,
    "Endgame": Endgame,
    "Fishing": Fishing,
    "Home": Home,
    "Inventory": Inventory,
    "MaplesLab": MaplesLab,
    "NPCs": NPCs,
    "Onboarding": Onboarding,
    "Pokemon": Pokemon,
    "SetBuilder": SetBuilder,
    "StartScreen": StartScreen,
    "StoryCutscene": StoryCutscene,
    "TutorialLog": TutorialLog,
    "Zones": Zones,
    "Storage": Storage,
    "Pokedex": Pokedex,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};