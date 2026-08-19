# 🚀 Day 05: Jenkins Backup & Restore

An automated bash script for backing up and restoring Jenkins data with Docker container management.

## 📋 Overview

This script provides an interactive menu-driven interface to:
- **Backup** Jenkins data directory to timestamped ZIP files
- **Restore** Jenkins from the latest backup
- **Automatically manage** Jenkins Docker container (stop/start during operations)

## ✨ Features

- ✅ Automatic container state management (stops before backup/restore, restarts after)
- ✅ Timestamped backup files for easy versioning
- ✅ Safe restore from latest backup
- ✅ Interactive menu interface
- ✅ Container existence and status checks
- ✅ Error handling and user notifications

## 🎬 Video Demonstration

[![Watch on Youtube](https://i.ytimg.com/vi/2CkjOCzHn4Y/maxresdefault.jpg)](https://youtu.be/2CkjOCzHn4Y)

## 🔧 Prerequisites

- **Docker** installed and running
- **Bash** shell (Windows Subsystem for Linux)
- **zip/unzip** utilities installed
- Jenkins running in a Docker container

## ⚙️ Configuration

Before running the script, update the following variables at the top of `backup_and_restore.sh`:

```bash
JENKINS_HOME_BASE="/HDD2TB/iansari/jenkins"      # Base directory path
JENKINS_DATA_DIR="$JENKINS_HOME_BASE/jenkins_data"  # Jenkins data directory
BACKUP_DIR="$JENKINS_HOME_BASE/jenkins_backups"     # Backup storage location
CONTAINER_NAME="jenkins"                             # Docker container name
```

### Configuration Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JENKINS_HOME_BASE` | Base directory containing Jenkins data | `/HDD2TB/iansari/jenkins` |
| `JENKINS_DATA_DIR` | Jenkins home directory with all data | `$JENKINS_HOME_BASE/jenkins_data` |
| `BACKUP_DIR` | Directory to store backup ZIP files | `$JENKINS_HOME_BASE/jenkins_backups` |
| `CONTAINER_NAME` | Name of your Jenkins Docker container | `jenkins` |

## 🚀 Usage

1. **Make the script executable:**
   ```bash
   chmod +x backup_and_restore.sh
   ```

2. **Run the script:**
   ```bash
   ./backup_and_restore.sh
   ```

3. **Select an option from the menu:**
   ```
   =================================
   🛠 Jenkins Backup & Restore Menu
   =================================
   1. Take backup
   2. Restore latest backup
   x. Exit
   =================================
   ```

## 📦 Backup Process

When you select **"1. Take backup"**, the script:

1. 🛑 Checks if Jenkins container exists
2. 🛑 Stops the Jenkins container (if running)
3. 💾 Creates a ZIP backup with timestamp: `jenkins_backup_YYYYMMDD_HHMMSS.zip`
4. ▶️ Restarts the Jenkins container (if it was running)
5. ✅ Confirms backup completion

**Backup file naming:** `jenkins_backup_20251203_213000.zip`

## ♻️ Restore Process

When you select **"2. Restore latest backup"**, the script:

1. 🔍 Finds the most recent backup file
2. 🛑 Stops the Jenkins container (if running)
3. 🗑️ Removes current Jenkins data directory
4. 📂 Creates fresh Jenkins data directory
5. 📦 Extracts the latest backup
6. ▶️ Restarts the Jenkins container (if it existed)
7. ✅ Confirms restore completion

> **⚠️ Warning:** Restore will completely replace your current Jenkins data with the backup!

## 🔐 Safety Features

- **Container checks:** Validates container existence before operations
- **State awareness:** Only stops/starts containers when appropriate
- **Backup validation:** Checks for backup files before restore
- **Error notifications:** Provides clear warnings for issues
- **User confirmation:** Pauses after operations for user acknowledgment

## 📁 Directory Structure

```
/HDD2TB/iansari/jenkins/
├── jenkins_data/           # Jenkins home directory
│   ├── jobs/
│   ├── plugins/
│   ├── config.xml
│   └── ...
└── jenkins_backups/        # Backup storage
    ├── jenkins_backup_20251201_100000.zip
    ├── jenkins_backup_20251202_153000.zip
    └── jenkins_backup_20251203_213000.zip
```

## 🛡️ Best Practices

1. **Regular backups:** Schedule regular backups (e.g., daily via cron)
2. **Verify backups:** Periodically test restore process
3. **Disk space:** Monitor backup directory size
4. **Off-site storage:** Copy critical backups to external storage
5. **Before upgrades:** Always backup before Jenkins updates

## 🔄 Example Cron Job

To automate daily backups at 2 AM:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path as needed)
0 2 * * * /opt/scripts/backup.sh
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Container does not exist" | Verify `CONTAINER_NAME` matches your Docker container |
| "No backups found" | Check `BACKUP_DIR` path and ensure backups exist |
| "Failed to stop container" | Check Docker daemon is running and you have permissions |
| Backup ZIP is too large | Consider excluding unnecessary directories |

## 📝 Notes

- The script uses `zip` compression (may take time for large Jenkins instances)
- Backup includes ALL files in `jenkins_data` directory
- Restore automatically selects the most recent backup (sorted by timestamp)
- Container state is preserved (won't start container if it wasn't running)

## 🤝 Contributing

Feel free to enhance this script with:
- Backup rotation (delete old backups)
- Compression options
- Remote backup support
- Email notifications
- Backup verification

## 📄 License

This script is part of the Jenkins-Zero-To-Hero tutorial series.


**💡 Tip:** Always verify your backup completed successfully before making major changes to Jenkins!

## 🧠 About This Project

This project is maintained by **DevOps In Action**, mainly focusing on practical, hands-on DevOps setups for CI/CD automation, containerization, and infrastructure management.


### 💼 Connect with Me 👇😊

*   🔥 [**YouTube**](https://www.youtube.com/@DevOpsinAction?sub_confirmation=1)
*   ✍️ [**Blog**](https://ibraransari.blogspot.com/)
*   💼 [**LinkedIn**](https://www.linkedin.com/in/ansariibrar/)
*   👨‍💻 [**GitHub**](https://github.com/meibraransari?tab=repositories)
*   💬 [**Telegram**](https://t.me/DevOpsinActionTelegram)
*   🐳 [**Docker Hub**](https://hub.docker.com/u/ibraransaridocker)

### ⭐ If You Found This Helpful...

***Please star the repo and share it! Thanks a lot!*** 🌟
