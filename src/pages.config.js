import Crafting from './pages/Crafting';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import NPCs from './pages/NPCs';
import Pokemon from './pages/Pokemon';
import Zones from './pages/Zones';
import Battle from './pages/Battle';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Crafting": Crafting,
    "Home": Home,
    "Inventory": Inventory,
    "NPCs": NPCs,
    "Pokemon": Pokemon,
    "Zones": Zones,
    "Battle": Battle,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};