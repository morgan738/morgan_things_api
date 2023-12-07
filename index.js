const express = require('express');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/morgan_api_db');

const app = express();
app.use(express.json());
app.use(require('cors')());

app.get('/api/things', async(req, res, next)=> {
  try {
    const response = await client.query('SELECT * FROM things');
    res.send(response.rows);
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/things/:id', async(req, res, next)=> {
  try {
    const response = await client.query('DELETE FROM things WHERE id = $1', [ req.params.id ]);
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/things', async(req, res, next)=> {
  try {
    const response = await client.query('INSERT INTO things(name) VALUES($1) RETURNING *', [ req.body.name || null ]);
    res.send(response.rows[0]);
  }
  catch(ex){
    next(ex);
  }
});

app.put('/api/things/:id', async(req, res, next)=> {
  try {
    const response = await client.query('UPDATE things SET name = $1 WHERE id = $2 RETURNING *', [ req.body.name || null, req.params.id ]);
    res.send(response.rows[0]);
  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  res.status(500).send({ error: err });
});

const PORT = process.env.PORT || 3000;

const init = async()=> {
  try {
    await client.connect();
    app.listen(PORT, ()=> {
      console.log(`listening on port ${PORT}`);
    });
    const SQL = `
      DROP TABLE IF EXISTS things;
      CREATE TABLE things(
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );
      INSERT INTO things (name) VALUES('foo');
      INSERT INTO things (name) VALUES('bar');
      INSERT INTO things (name) VALUES('bazz');
    `;

    await client.query(SQL);
  }
  catch(ex){
    console.log(ex);
  }
}

init();
