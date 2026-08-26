import UIKit
import WebKit
import SQLite3

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var db: OpaquePointer?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // 1. Inicializar Base de Dados SQLite no iOS Sandbox
        initDatabase()
        
        // 2. Criar Janela Principal com WKWebView
        window = UIWindow(frame: UIScreen.main.bounds)
        let viewController = UIViewController()
        
        let config = WKWebViewConfiguration()
        let webView = WKWebView(frame: viewController.view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        
        if let htmlPath = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "www") {
            let url = URL(fileURLWithPath: htmlPath)
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        
        viewController.view.addSubview(webView)
        window?.rootViewController = viewController
        window?.makeKeyAndVisible()
        
        return true
    }

    private func initDatabase() {
        let fileURL = try! FileManager.default
            .url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
            .appendingPathComponent("nanucloud_ios.sqlite")

        if sqlite3_open(fileURL.path, &db) == SQLITE_OK {
            let createTable = """
            CREATE TABLE IF NOT EXISTS nanucloud_simulations (
                id TEXT PRIMARY KEY,
                product TEXT,
                cost DOUBLE,
                pvp DOUBLE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
            sqlite3_exec(db, createTable, nil, nil, nil)
            print("Base de dados SQLite iOS inicializada com sucesso: \(fileURL.path)")
        }
    }
}
