import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

function App() {
  const [sensorData, setSensorData] = useState({
    adc: 0,
    co2: 0,
    nh3: 0,
    nox: 0
  });
  const [connectionStatus, setConnectionStatus] = useState('Menghubungkan...');

  useEffect(() => {
    const clientId = 'mqttjs_' + Math.random().toString(16).substring(2, 8);
    const host = 'wss://broker.hivemq.com:8884/mqtt';

    const options = {
      keepalive: 60,
      clientId: clientId,
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
    };

    const client = mqtt.connect(host, options);

    client.on('connect', () => {
      setConnectionStatus('Terhubung');
      client.subscribe('proyek/sensor/mq135', (err) => {
        if (err) console.error('Gagal subscribe:', err);
      });
    });

    client.on('message', (topic, message) => {
      if (topic === 'proyek/sensor/mq135') {
        try {

          const parsedData = JSON.parse(message.toString());
          setSensorData(parsedData);
        } catch (e) {
          console.error("Gagal mengurai JSON:", e);
        }
      }
    });

    client.on('error', (err) => {
      console.error('Connection error: ', err);
      client.end();
    });

    client.on('reconnect', () => setConnectionStatus('Menghubungkan ulang...'));

    return () => {
      if (client) client.end();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-slate-900 rounded-xl p-6 mb-8 shadow-lg text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">IoT Gas Monitor</h1>
            <p className="text-slate-400 text-sm mt-1">Sensor: MQ-135 Semiconductor</p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-full">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'Terhubung' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
            <span className="text-sm font-medium">{connectionStatus}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-slate-500 text-sm font-semibold mb-2">Estimasi CO2</h2>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-extrabold text-slate-800">
                {sensorData.co2.toFixed(1)}
              </span>
              <span className="text-slate-400 font-medium mb-1">ppm</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-slate-500 text-sm font-semibold mb-2">Estimasi NH3 (Amonia)</h2>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-extrabold text-slate-800">
                {sensorData.nh3.toFixed(2)}
              </span>
              <span className="text-slate-400 font-medium mb-1">ppm</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-slate-500 text-sm font-semibold mb-2">Estimasi NOx</h2>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-extrabold text-slate-800">
                {sensorData.nox.toFixed(2)}
              </span>
              <span className="text-slate-400 font-medium mb-1">ppm</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-slate-500 text-sm font-semibold mb-2">Sinyal Analog (ADC)</h2>
            <div className="flex items-end space-x-2">
              <span className="text-4xl font-extrabold text-slate-600">
                {sensorData.adc}
              </span>
              <span className="text-slate-400 font-medium mb-1">/ 1023</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;