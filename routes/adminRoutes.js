const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/dashboard-stats', async (req, res) => {
  try {
    const [busCount] = await db.query('SELECT COUNT(*) as count FROM busdetails');
    const [fireRequests] = await db.query('SELECT COUNT(*) as count FROM fire_requests');
    const [falsePositives] = await db.query('SELECT COUNT(*) as count FROM fire_requests WHERE status = "Rejected"');
    const [employees] = await db.query('SELECT COUNT(*) as count FROM employeedetails');
    const [victims] = await db.query('SELECT COUNT(*) as count FROM fire_victims');
   
    res.json({
      busCount: busCount[0].count,
      fireAlerts: fireRequests[0].count,
      falsePositives: falsePositives[0].count,
      employees: employees[0].count,
      victims: victims[0].count,
      systemUptime: "98%"
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/module-status', async (req, res) => {
  try {
    const modules = [
      {
        id: 1,
        name: "User Management",
        status: "Active",
        metrics: {
          users: (await db.query('SELECT COUNT(*) as count FROM user'))[0][0].count,
          activeSessions: 450
        }
      },
      {
        id: 2,
        name: "Vehicle Management",
        status: "Active",
        metrics: {
          vehicles: (await db.query('SELECT COUNT(*) as count FROM busdetails'))[0][0].count,
          operational: (await db.query('SELECT COUNT(*) as count FROM busdetails WHERE status = "Active"'))[0][0].count
        }
      },
      {
        id: 3,
        name: "Fire Service Bus",
        status: "Active",
        metrics: {
          routes: 25,
          uptime: "95%"
        }
      },
      {
        id: 4,
        name: "Employee Management",
        status: "Active",
        metrics: {
          employees: (await db.query('SELECT COUNT(*) as count FROM employeedetails'))[0][0].count,
          active: (await db.query('SELECT COUNT(*) as count FROM employeedetails WHERE status = "Active"'))[0][0].count
        }
      }
    ];

    res.json(modules);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/recent-activity', async (req, res) => {
  try {
    const activities = await db.query(`
      (SELECT 'fire_request' as type, id, name, created_at, status, CONCAT('New fire alert: ', incidentType) as description FROM fire_requests ORDER BY created_at DESC LIMIT 3)
      UNION ALL
      (SELECT 'bus_service' as type, id, Busno as name, date as created_at, 'completed' as status, CONCAT('Bus service: ', serviceDescription) as description FROM busservice ORDER BY date DESC LIMIT 2)
      UNION ALL
      (SELECT 'employee' as type, id, Name as name, NOW() as created_at, 'active' as status, CONCAT('New employee: ', Designation) as description FROM employeedetails ORDER BY id DESC LIMIT 2)
      ORDER BY created_at DESC LIMIT 5
    `);

    res.json(activities[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
