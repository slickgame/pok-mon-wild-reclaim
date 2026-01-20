import Home from './pages/Home';
import Pokemon from './pages/Pokemon';
import Zones from './pages/Zones';
import Inventory from './pages/Inventory';
import Crafting from './pages/Crafting';
import NPCs from './pages/NPCs';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Pokemon": Pokemon,
    "Zones": Zones,
    "Inventory": Inventory,
    "Crafting": Crafting,
    "NPCs": NPCs,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};