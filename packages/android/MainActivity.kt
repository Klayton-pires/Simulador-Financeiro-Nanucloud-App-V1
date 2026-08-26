package com.nanucloud.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var dbHelper: NanuCloudDbHelper

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        dbHelper = NanuCloudDbHelper(this)

        webView = findViewById(R.id.webView)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.allowFileAccess = true
        webView.webViewClient = WebViewClient()

        // Bridge nativo Android <-> JavaScript
        webView.addJavascriptInterface(WebAppInterface(), "AndroidNative")

        // Carregar a aplicação localmente
        webView.loadUrl("file:///android_asset/index.html")
    }

    inner class WebAppInterface {
        @JavascriptInterface
        fun saveSimulationNative(product: String, cost: Double, iva: Double, duty: Double, margin: Double, pvp: Double) {
            dbHelper.saveSimulation(product, cost, iva, duty, margin, pvp)
            runOnUiThread {
                Toast.makeText(this@MainActivity, "Simulação gravada no SQLite Android!", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
