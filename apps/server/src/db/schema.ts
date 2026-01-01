// import { pool } from "./db";
// export async function initializeDatabase() {
//   try {
 
//     await pool.query(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;`);

   
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS trades (
//         time        TIMESTAMPTZ       NOT NULL,
//         symbol      TEXT              NOT NULL,
//         bid_price   DOUBLE PRECISION  NOT NULL,
//         ask_price   DOUBLE PRECISION  NOT NULL
//       );
//     `);


//     await pool.query(`
//       SELECT create_hypertable(
//         'trades',
//         'time',
//         if_not_exists => TRUE,
//         chunk_time_interval => INTERVAL '1 hour'
//       );
//     `);

//     console.log("✅ Trades table & hypertable ready.");

  
//     const intervals = [
//       { name: "1m", bucket: "1 minute", start_offset: "1 hour", end_offset: "1 minute", schedule: "30 seconds" },
//       { name: "5m", bucket: "5 minutes", start_offset: "2 hours", end_offset: "5 minutes", schedule: "1 minute" },
//       { name: "15m", bucket: "15 minutes", start_offset: "6 hours", end_offset: "15 minutes", schedule: "5 minutes" },
//       { name: "30m", bucket: "30 minutes", start_offset: "12 hours", end_offset: "30 minutes", schedule: "10 minutes" }
//     ];

//     for (const interval of intervals) {
 
//       await pool.query(`
//         CREATE MATERIALIZED VIEW IF NOT EXISTS candlestick_${interval.name}
//         WITH (timescaledb.continuous) AS
//         SELECT
//           time_bucket('${interval.bucket}', time) AS bucket,
//           symbol,
//           FIRST(ask_price, time) AS open,
//           MAX(ask_price) AS high,
//           MIN(ask_price) AS low,
//           LAST(ask_price, time) AS close
//         FROM trades
//         GROUP BY bucket, symbol
//         WITH NO DATA;
//       `);

  
//       const policyCheck = await pool.query(`
//         SELECT 1 FROM timescaledb_information.jobs
//         WHERE proc_name = 'policy_refresh_continuous_aggregate'
//           AND hypertable_name = 'candlestick_${interval.name}';
//       `);


//       if (policyCheck.rowCount === 0) {
//         await pool.query(`
//           SELECT add_continuous_aggregate_policy(
//             'candlestick_${interval.name}',
//             start_offset => INTERVAL '${interval.start_offset}',
//             end_offset   => INTERVAL '${interval.end_offset}',
//             schedule_interval => INTERVAL '${interval.schedule}'
//           );
//         `);
//       }

//       await pool.query(`CALL refresh_continuous_aggregate('candlestick_${interval.name}', NULL, NULL);`);

//       console.log(`✅ Candlestick ${interval.name} ready.`);
//     }

//     console.log("🎉 Database initialized successfully.");
//   } catch (err) {
//     console.error(" Error initializing database:", err);
//     throw err;
//   }
// }
