import Header from './Header'
import Sidebar from './Sidebar'

export default function MainLayout({role, activePage, onNavigate, children}){
    return(
        <div className = "app-layout">
            <Header role = {role}/>

            <div className = "app-body">
                <Sidebar role = {role} activePage={activePage} onNavigate={onNavigate}/>

                <main className = "app-content">{children}</main>
            </div>
        </div>
    );
}