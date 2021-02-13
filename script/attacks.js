

var g_available_attacks, g_exploit_names

initAttacks = function(){
  g_available_attacks = ['ping','execode','absorb','smtp','ssh','ftp','telnet','history','diskscan','accessroot','installexploit','sonyclose','sonyopen','sonydownload','sonyplay','sonyimgupload','sonyrestart','sonyimgunmount','eonsflood']
  g_exploit_names = ['force','pingspike','smtpexploit']  
}

//pingspike
//remotedesktop
//smtpexploit


//
// Attacks
//


// Check if attack has adventure_slug
// Else check if host has attackcallbacks[x_attack.slug]
// Else check if attack has callback
// Else cail Attack Fail
attackCallback = function(x_attack, x_host){
  if(x_attack.adventure_slug){
    launchAdventureFromSlug(x_attack.adventure_slug)
  }else if(x_host.attackcallbacks[x_attack.slug]){
    x_host.attackcallbacks[x_attack.slug](x_attack, x_host)
  }else if(x_attack.callback){
    x_attack.callback(x_host)
  }else{
    x_attack.fail(x_host)
  }
  refreshMenu()
}



g_host_attacks = {
  absorb:{
    weight:400,
    title: "吸收主机",
    desc: "吸收：与远程主机融为一体 需要root或管理员权限。",
    actiontitle: "正在吸收 ",
    callback: function(x_host){absorbHost(x_host)},
    fail: function(x_host){write("我是错误")},
    validate: function(x_host){return x_host.vuls.includes('absorb');}
  },

  force: {
    weight: 800,
    title: "力量吸收",
    desc: "力量吸收:你对现实世界的理解已经超越了你的吸收能力。",
    actiontitle: "正在吸收 ",
    unclickable: function(x_host){return forceAbsorbUnablickable(x_host)},
    callback: function(x_host){forceAbsorbHost(x_host)},
    fail: function(x_host){write("我是错误")},
    validate: function(x_host){return x_host.known;}
  },

  // execode stuff
  installexploit: {
    weight: 1,
    title: "安装漏洞",
    actiontitle: "安装漏洞 ",
    validate: function(x_host){return x_host.vuls.includes('execode')},
    unclickable: function(x_host){return hasExploits(x_host) ?  false : "没有已知的漏洞可以针对 "+x_host.os+" 操作系统。"},
    callback: function(x_host){
      exploitHost(x_host)
    }
  },

  diskscan: {
    weight: 1,
    title: "磁盘扫描",
    actiontitle: "正在扫描磁盘 ",
    validate: function(x_host){return x_host.vuls.includes('execode')},
    callback: function(x_host){
      if(x_host.already_mounted_disks){
        addBuffer("你已经挂载了这块磁盘。")
      }else if(x_host.mountable_disks){
        x_host.mountable_disks(x_host)
      }else{
        addBuffer("该用户没有访问任何磁盘或文件的权限。")
      }
      writeBuffer()
    }
  },
  accessroot: {
    weight: 1,
    title: "访问root",
    actiontitle: "访问root ",
    validate: function(x_host){return x_host.vuls.includes('execode')},
    fail: function(x_host){write("密码被拒绝")},
    callback: function(x_host){
      if(x_host.slug == 'sony'){
        // Sony Hack
        if( g_active_data_types['sony-key'] > 0){
          write("<span class='exe'>成功</span><br>你已成功登录到root帐户。 你可以完全访问主机的所有内存和处理能力。<br><br><span class='exe'>你现在能够吸收主机了。</span>")
          addHostVul('sony', 'absorb') 
        }else{
          write("Root访问受硬件防御保护。需要私钥。")
        }
      }else{
        // Normal Root
        x_host.current_userpw_method = 'accessroot'
        x_host.current_userpw_user = 'root'
        launchAdventureFromSlug('userpw_pw') 
      }
    }
  },





  // Sony

  sonyplay:{
    title:"玩游戏",
    unclickable: function(x_host){return  "PS版本错误：不允许向后兼容。"},
    validate: function(x_host){return x_host.vuls.includes('sony') && !x_host.sonyopen}
  },
  sonydownload:{
    title:"下载镜像",
    unclickable: function(x_host){return  "parappatharappa.iso下载：需要695mB磁盘空间"},
    validate: function(x_host){return x_host.vuls.includes('sony') && x_host.sonyopen}
  },
  sonyopen:{
    weight:1,
    title:"打开磁盘",
    actiontitle: "正在打开 ",
    validate: function(x_host){return x_host.vuls.includes('sony') && !x_host.sonyopen }
  },
  sonyclose:{
    weight:1,
    title:"关闭磁盘",
    actiontitle: "正在关闭 ",
    validate: function(x_host){return x_host.vuls.includes('sony') && x_host.sonyopen}
  },
  sonyimgupload:{
    weight:1,
    title: "挂载内存驱动器",
    actiontitle: "安装驱动器到 ",
    unclickable: function(x_host){return  (( g_active_data_types['sony-usb'] > 0) ?  false :  "没有可用的.img文件")},
    validate: function(x_host){return x_host.vuls.includes('sony') && !x_host.mounted }
  },
  sonyimgunmount:{
    weight:1,
    title: "卸载内存驱动器",
    validate: function(x_host){return x_host.vuls.includes('sony') && !!x_host.mounted}
  },
  sonyrestart:{
    weight:1,
    title: "重新启动主机",
    actiontitle: "正在重启 ",
    validate: function(x_host){return x_host.vuls.includes('sony')}
  },



  ping:{
    weight: 1,
    title: "Ping",
    desc: "Ping：检查主机的状态。",
    actiontitle: "正在ping ",
    fail: function(x_host){write("发出ping后没有返回")},
    validate: function(x_host){return true;}
  },
  scan:{
    weight: 100,
    title: "扫描主机",
    desc: "扫描：检测名称、操作系统、架构和漏洞。",
    actiontitle: "正在扫描 ",
    fail: function(x_host){write("我是错误")},
    validate: function(x_host){return !x_host.known;}
  },
  pingspike:{
    weight: 1,
    title: "Ping Spike",
    desc: "Ping Spike：通过Ping漏洞进行远程代码注入。",
    actiontitle: "正在Ping Spike ",
    callback: function(x_host){
      if(x_host.vuls.includes('pingspike')){
        write("<span class='exe'>成功</span><br>Ping Spike成功。你可以在主机上的用户层远程执行代码。")
        rmHostVul(x_host.slug,'pingspike')
        addHostVul(x_host.slug,'execode')
      }else{
        write("Ping Spike不成功，主机不容易受到这种攻击。")
      }
    },
    validate: function(x_host){return !x_host.vuls.includes('execode') && x_host.known},
  },
  smtp:{
    weight: 1,
    title: "SMTP命令",
    actiontitle: "SMTP命令到 ",
    fail: function(x_host){write("缺少smtp回调。")},
    validate: function(x_host){return x_host.vuls.includes('smtp')},
  },
  smtpexploit:{
    weight: 50,
    title: "SMTP漏洞",
    desc: "SMTP漏洞：邮件服务器在SMTP协议上的漏洞。",
    actiontitle: "SMTP Exploit to ",
    fail: "电子邮件服务器受到了SMTP攻击的保护。",
    validate: function(x_host){return x_host.vuls.includes('smtp') && hasAttack('smtpexploit') && (!x_host.already_mounted_disks)},
  },
  ssh:{
    weight: 1,
    title: "通过SSH进行连接",
    desc: "SSH：用于访问主机的协议。",
    actiontitle: "SSH连接到 ",
    fail: function(x_host){write("SSH连接被拒绝")},
    validate: function(x_host){return x_host.vuls.includes('ssh')},
    adventure_slug: 'ssh',
  },
  ftp:{
    weight: 1,
    title: "通过FTP进行连接",
    desc: "FTP：用于获得对主机的磁盘访问的协议。",
    actiontitle: "FTP连接到 ",
    fail: function(x_host){write("FTP连接被拒绝")},
    validate: function(x_host){return x_host.vuls.includes('ftp')},
    adventure_slug: 'ftp',
  },
  telnet:{
    weight: 1,
    title: "通过TELNET连接",
    actiontitle: "TELNET连接到 ",
    desc: "TELNET：用于通过面向文本的通信与主机进行交互的协议。",
    fail: function(x_host){write("TELNET连接被拒绝")},
    validate: function(x_host){return x_host.vuls.includes('telnet')},
    adventure_slug: 'telnet',
  },

  remotedesktop:{
    weight: 1,
    title: "远程桌面",
    actiontitle: "RDP连接到 ",
    desc: "RDP：允许用户使用正确的凭据远程控制计算机的协议。 Microsoft拥有版权。",
    fail: function(x_host){write("The RDP connection was refused")},
    validate: function(x_host){return x_host.vuls.includes('remotedesktop')},
    adventure_slug: 'remotedesktop',
  },





}

writeAttacks = function(){
  addBuffer("<span class='exe'>漏洞</span>")
  $.each(g_host_attacks,function(slug,x_attack){
    if(g_available_attacks.includes(slug) && g_exploit_names.includes(slug) && x_attack.desc)
      addBuffer(x_attack.desc)
  })
  $.each(g_active_exploits,function(i,x_exploit){
    addBuffer(x_exploit.to_s())
  })
  writeBuffer()
}

writeProtocols = function(){
  addBuffer("<span class='exe'>协议</span>")
  $.each(g_host_attacks,function(slug,x_attack){
    if(g_available_attacks.includes(slug) && !g_exploit_names.includes(slug) && x_attack.desc)
      addBuffer(x_attack.desc)
  })
  writeBuffer()
}

hasAttack = function(attack_slug){
  return g_available_attacks.includes(attack_slug)
}


// Add slug to each attack
Object.keys(g_host_attacks).forEach(function (key) { 
  var x_attack = g_host_attacks[key]
  x_attack.slug = key
})


// see glitched host. ping host, get glitched ping back. add special options to trigger rewind

