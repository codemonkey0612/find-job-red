module.exports = {
  apps: [
    {
      name: "find-job-red-backend",
      script: "./dist/index.js",
      cwd: "/var/www/find-job-red/server",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        DB_HOST: "localhost",
        DB_USER: "jobuser",
        DB_PASSWORD: "password",
        DB_NAME: "job_search_db"
      }
    }
  ]
};
