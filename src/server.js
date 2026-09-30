import app from './app.js';
import { AppDataSource } from './data-source.js';

const port = process.env.PORT ?? 3000;

// Primero conectamos con la base de datos y después levantamos el servidor
await AppDataSource.initialize();
app.listen(port, () => console.log(`Servidor escuchando en http://localhost:${port}`));
