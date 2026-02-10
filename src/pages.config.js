/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Battle from './pages/Battle';
import Contests from './pages/Contests';
import Crafting from './pages/Crafting';
import Endgame from './pages/Endgame';
import Fishing from './pages/Fishing';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import MaplesLab from './pages/MaplesLab';
import PartyManager from './pages/PartyManager';
import Pokedex from './pages/Pokedex';
import Pokemon from './pages/Pokemon';
import SetBuilder from './pages/SetBuilder';
import Storage from './pages/Storage';
import StoryCutscene from './pages/StoryCutscene';
import Town from './pages/Town';
import TutorialLog from './pages/TutorialLog';
import Onboarding from './pages/Onboarding';
import StartScreen from './pages/StartScreen';
import NPCs from './pages/NPCs';
import Zones from './pages/Zones';
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
    "PartyManager": PartyManager,
    "Pokedex": Pokedex,
    "Pokemon": Pokemon,
    "SetBuilder": SetBuilder,
    "Storage": Storage,
    "StoryCutscene": StoryCutscene,
    "Town": Town,
    "TutorialLog": TutorialLog,
    "Onboarding": Onboarding,
    "StartScreen": StartScreen,
    "NPCs": NPCs,
    "Zones": Zones,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};