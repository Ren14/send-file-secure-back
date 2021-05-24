
module.exports = {

  async getStatus(req, res) {
    const healthCheckData = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now()
    }

    try {
      res.send(healthCheckData);
    } catch (error) {
      healthCheckData.message = error;
      res.status(503).send();
    }
  }
}
