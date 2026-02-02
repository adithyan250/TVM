import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => {
    return (
        <div className="flex min-h-screen bg-[#0f172a] text-slate-100 font-inter">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Header title={title} />
                <main className="flex-1 p-8 pt-0 overflow-y-auto">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
