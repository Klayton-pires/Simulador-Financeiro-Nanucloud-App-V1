package com.nanucloud.app

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class NanuCloudDbHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "nanucloud_android.db"
        const val DATABASE_VERSION = 1

        const val TABLE_CLIENTS = "nanucloud_clients"
        const val TABLE_SIMULATIONS = "nanucloud_simulations"
    }

    override fun onCreate(db: SQLiteDatabase) {
        val createClients = """
            CREATE TABLE $TABLE_CLIENTS (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                company_name TEXT NOT NULL,
                nif TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                queries_remaining INTEGER DEFAULT 500,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """.trimIndent()

        val createSimulations = """
            CREATE TABLE $TABLE_SIMULATIONS (
                id TEXT PRIMARY KEY,
                product_description TEXT NOT NULL,
                cost_price REAL NOT NULL,
                iva_amount REAL NOT NULL,
                customs_duty REAL NOT NULL,
                profit_margin REAL NOT NULL,
                final_pvp REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """.trimIndent()

        db.execSQL(createClients)
        db.execSQL(createSimulations)

        // Inserir dados padrão Android
        val cv = ContentValues().apply {
            put("id", "android_cli_01")
            put("name", "Dr. Paulo Klayton Monteiro")
            put("company_name", "Monteiro Comercial & Logística")
            put("nif", "5417089123")
            put("email", "monteiro.comercial@gmail.com")
            put("queries_remaining", 2500)
            put("is_active", 1)
        }
        db.insert(TABLE_CLIENTS, null, cv)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_CLIENTS")
        db.execSQL("DROP TABLE IF EXISTS $TABLE_SIMULATIONS")
        onCreate(db)
    }

    fun saveSimulation(product: String, cost: Double, iva: Double, duty: Double, margin: Double, pvp: Double): Long {
        val db = writableDatabase
        val cv = ContentValues().apply {
            put("id", "sim_droid_" + System.currentTimeMillis())
            put("product_description", product)
            put("cost_price", cost)
            put("iva_amount", iva)
            put("customs_duty", duty)
            put("profit_margin", margin)
            put("final_pvp", pvp)
        }
        return db.insert(TABLE_SIMULATIONS, null, cv)
    }
}
