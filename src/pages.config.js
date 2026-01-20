import Home from './pages/Home';
import Pokemon from './pages/Pokemon';
import Zones from './pages/Zones';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Pokemon": Pokemon,
    "Zones": Zones,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};