import Header from './Header'
import Sidebar from './Sidebar'

export default function MainLayout({role, user, activePage, onNavigate, onLogout, children}){
    return(
        <div className = "app-layout">
            <Header role = {role} user={user} onLogout={onLogout}/>

            <div className = "app-body">
                <Sidebar role = {role} activePage={activePage} onNavigate={onNavigate}/>

                <main className = "app-content">{children}</main>
            </div>
        </div>
    );
}