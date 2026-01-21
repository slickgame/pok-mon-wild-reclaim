import Battle from './pages/Battle';
import Contests from './pages/Contests';
import Crafting from './pages/Crafting';
import Endgame from './pages/Endgame';
import Fishing from './pages/Fishing';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import MaplesLab from './pages/MaplesLab';
import NPCs from './pages/NPCs';
import Pokemon from './pages/Pokemon';
import SetBuilder from './pages/SetBuilder';
import Zones from './pages/Zones';
import Onboarding from './pages/Onboarding';
import TutorialLog from './pages/TutorialLog';
import StartScreen from './pages/StartScreen';
import StoryCutscene from './pages/StoryCutscene';
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
    "Pokemon": Pokemon,
    "SetBuilder": SetBuilder,
    "Zones": Zones,
    "Onboarding": Onboarding,
    "TutorialLog": TutorialLog,
    "StartScreen": StartScreen,
    "StoryCutscene": StoryCutscene,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};