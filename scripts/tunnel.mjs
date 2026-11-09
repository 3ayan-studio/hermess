import { spawn } from 'node:child_process'
import QRCode from 'qrcode'

const PORT = process.env.PORT || 3001
const NGROK_API = 'http://127.0.0.1:4040/api/tunnels'

console.log('\x1b[36m%s\x1b[0m', `🚀 Démarrage du tunnel ngrok pour http://localhost:${PORT}...`)

// Démarrer ngrok
const ngrokProcess = spawn('ngrok', ['http', PORT.toString(), '--host-header=rewrite', '--log=stdout'], {
    stdio: ['ignore', 'pipe', 'pipe']
})

let isStopping = false

function cleanup() {
    if (isStopping) return
    isStopping = true
    console.log('\n\x1b[33m%s\x1b[0m', '🛑 Arrêt du tunnel ngrok...')
    ngrokProcess.kill('SIGINT')
    process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('exit', cleanup)

ngrokProcess.stderr.on('data', (data) => {
    const err = data.toString()
    if (err.includes('ERR_') || err.includes('error')) {
        console.error('\x1b[31m%s\x1b[0m', `[ngrok error] ${err.trim()}`)
    }
})

// Polling de l'API ngrok pour récupérer l'URL publique
async function waitForTunnel(retries = 25, delayMs = 400) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(NGROK_API)
            if (res.ok) {
                const json = await res.json()
                const tunnel = json.tunnels?.find((t) => t.proto === 'https') || json.tunnels?.[0]
                if (tunnel && tunnel.public_url) {
                    return tunnel.public_url
                }
            }
        } catch {
            // Attente du démarrage de l'API locale
        }
        await new Promise((r) => setTimeout(r, delayMs))
    }
    throw new Error('Impossible de contacter le tunnel ngrok après plusieurs tentatives.')
}

async function run() {
    try {
        const publicUrl = await waitForTunnel()

        // Génération du QR Code en terminal
        const qrTerminal = await QRCode.toString(publicUrl, {
            type: 'terminal',
            small: true
        })

        console.log('\n' + '='.repeat(60))
        console.log('\x1b[32m%s\x1b[0m', '  ✅ Tunnel ngrok connecté avec succès !')
        console.log('='.repeat(60))
        console.log('\n📱 Scannez ce QR Code avec l\'appareil photo de votre smartphone :\n')
        console.log(qrTerminal)
        console.log('\x1b[1m\x1b[34m%s\x1b[0m', `👉 Lien direct : ${publicUrl}`)
        console.log('\x1b[90m%s\x1b[0m', '💡 Note : Si ngrok gratuit vous affiche un avertissement, cliquez sur "Visit Site".')
        console.log('\x1b[90m%s\x1b[0m', 'Appuyez sur Ctrl+C pour arrêter le tunnel à tout moment.\n')
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `❌ Erreur : ${error.message}`)
        cleanup()
    }
}

run();

