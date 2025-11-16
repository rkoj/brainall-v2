"""Tool para executar comandos no Bastion VM"""
import paramiko
from app.config import settings

class BastionTool:
    def __init__(self):
        self.host = settings.BASTION_HOST
        self.user = settings.BASTION_USER
        self.password = settings.BASTION_PASSWORD
    
    def execute_command(self, command: str) -> dict:
        """Executa comando SSH no Bastion"""
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(
                self.host,
                username=self.user,
                password=self.password,
                timeout=10
            )
            
            stdin, stdout, stderr = client.exec_command(command)
            output = stdout.read().decode()
            error = stderr.read().decode()
            exit_code = stdout.channel.recv_exit_status()
            
            client.close()
            
            return {
                "success": exit_code == 0,
                "output": output,
                "error": error,
                "exit_code": exit_code
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "exit_code": -1
            }

bastion_tool = BastionTool()
