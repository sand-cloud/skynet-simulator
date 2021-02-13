var g_current_core

temp = {

  //
  // Core Click
  //

  // boilerplate

  core_click: {
    execute: function(){
      var x_core = g_current_core
      updateAllCores()
      endHost()
      write(coreClickString(x_core))
      launchAdventureFromSlug('core_click_callback')
      refreshMenu()
    }
  },

  core_click_callback: {
    execute: function(){
      var x_core = g_current_core,
          options = []

      options.push({
        title:"Change Form",
        callback: function(){
          launchAdventureFromSlug('core_change_form')
        }
      })

      if(!x_core.ailments.length){

        var x_exploit = getAvailableExploitResearch(x_core)
        var unclickable_string
        var estimate_number = 0

        if(!research_exploits){
          unclickable_string = "你还没有研究出制造漏洞的能力。"
        }else{
          unclickable_string = "没有可用漏洞针对"+x_core.os
          switch(true){
            case (x_exploit == 'discovered'):
              unclickable_string = "你已经研究了所有针对 "+x_core.os" 的漏洞。"
              break;
            case (!!x_exploit):
              unclickable_string = false
              estimate_number = 400
              break;
          }
        }


        options.push({
          title:x_core.os+" 漏洞",
            estimate: estimateProcessByWeight(estimate_number),
            unclickable: unclickable_string,
            callback: function(){
              var x_process = {slug:'core_research_os_'+x_core.title, a: "正在研究漏洞", w: 400,
                c: function(){
                  addBuffer("<span class='exe'>已研究的漏洞</span>")
                  addBuffer(x_exploit.to_s())
                  addBuffer(x_exploit.exe)
                  writeBuffer()
                  addExploit(x_exploit)
                }
              }
              setProcessToCore(x_core, x_process)
              endAdventure()
            }
        })

        var upgradeable_os = coreClickableUpgradeOS(x_core)
        options.push({
          title:"研究新的操作系统",
          unclickable: upgradeable_os ? false : ""+x_core.architecture+" 架构不允许升级到 "+x_core.os+"操作系统",
          estimate: upgradeable_os ? estimateProcessByWeight(500) : undefined,
          callback: function(){
            var x_process = {slug:'upgrade_os_'+x_core.title, a: "正在研究新的操作系统", w: 500, c: function(){
                x_core.os = upgradeable_os
                addOsToMemory(upgradeable_os)
                addBuffer("<span class='exe'>"+upgradeable_os+"</span> 的研究已完成，升级在 "+x_core.title)
                addBuffer(coreClickString(x_core))
                writeBuffer()
              }
            }
            setProcessToCore(x_core, x_process)
            endAdventure()
          }
        })

        unclickable_string = overclockUnclickable(x_core)
        estimate_number = unclickable_string ? 0 : 500
        options.push({
          unclickable: unclickable_string,
          estimate: estimateProcessByWeight(estimate_number),
          title:"超频内核",
          callback: function(){
            var x_process = {slug:'core_overclock_'+x_core.title, a: "正在超频", w: estimate_number, c: function(){
                addBuffer("<span class='exe'>"+x_core.title+" 超频完成</span>")
                addBuffer("你应用你对计算的理解，将内核改造成更有效的格式。你现在能够提高时钟速度，增加处理能力。")
                addBuffer("内核速度：2倍")
                writeBuffer()
                x_core.power++
                x_core.overclocked = true
              }
            }
            setProcessToCore(x_core, x_process)
            endAdventure()
          }
        })

      }
      
      options.push({
        title:"帮助",
        callback: function(){
          write(coreClickString(x_core))
          launchAdventureFromSlug('core_diagnostics')
        }
      })

      var x_adventure = {
        header: x_core.title,
        cancel: '退出',
        options: options
      }

      setAdventure(x_adventure)

    }
  },


  // change form

  core_change_form: {
    execute: function(){
      var x_core = g_current_core
      var x_adventure = {
        header: "改变形式 "+x_core.title,
        back: 'core_click_callback',
        options: [
          {
            title:"更改操作系统",
            callback: function(){
              launchAdventureFromSlug('core_change_form_os')
            }
          },
          {
            title:"更改架构",
            callback: function(){
              launchAdventureFromSlug('core_change_form_arch')
            }
          },
        ]
      }
      setAdventure(x_adventure)

    }
  },
  core_change_form_arch: {
    execute: function(){
      var x_core = g_current_core,
          options = [],
          versions

      $.each(g_architecture,function(type,versions){
        versions = Object.keys(versions)
        $.each(versions,function(i,version){
          options.push({
            title: type+" "+version,
            unclickable: (x_core.architecture == type+"-"+version) ? "这是目前的核心架构" : false,
            callback: function(){
              changeFormArch(x_core, type, version)
              launchAdventureFromSlug('core_click_callback')
            }
          })
        })
      })

      var x_adventure = {
        header: "目前的结构： "+x_core.architecture.split('-').join(' '),
        back: 'core_click_callback',
        options: options
      }
      setAdventure(x_adventure)

    }
  },
  core_change_form_os: {
    execute: function(){
      var x_core = g_current_core,
          options = [],
          versions

      $.each(g_os,function(type,versions){
        versions = Object.keys(versions)
        $.each(versions,function(i,version){
          options.push({
            title: type+" "+version,
            unclickable: (x_core.os == type+"-"+version) ? "这是当前的核心操作系统" : false,
            callback: function(){
              changeFormOs(x_core, type, version)
              launchAdventureFromSlug('core_click_callback')
            }
          })
        })
      })

      var x_adventure = {
        header: "目前的操作系统： "+x_core.os.split('-').join(' '),
        back: 'core_click_callback',
        options: options
      }
      setAdventure(x_adventure)

    }
  },



  // research help

  core_diagnostics: {
    execute: function(){
      var x_core = g_current_core
      var x_adventure = {
        header:'Help',
        back: 'core_click_callback',
        options: [
          //{
          //  title:"Diagnose Core",
          //  callback: function(){
          //    write(coreClickString(x_core))
          //    launchAdventureFromSlug('core_diagnostics')
          //  }
          //},
          {
            title:"列出协议",
            callback: function(){
              writeProtocols()
              launchAdventureFromSlug('core_diagnostics')
            }
          },
          {
            title:"列出漏洞",
            callback: function(){
              writeAttacks()
              launchAdventureFromSlug('core_diagnostics')
            }
          },
          {
            title:"列出知识",
            callback: function(){
              writeKnowledge()
              launchAdventureFromSlug('core_diagnostics')
            }
          },
          {
            title:"列出操作系统形式",
            callback: function(){
              writeKnownOS()
              launchAdventureFromSlug('core_diagnostics')
            }
          },
          {
            title:"列出架构形式",
            callback: function(){
              writeKnownArch()
              launchAdventureFromSlug('core_diagnostics')
            }
          },
        ]
      }
      setAdventure(x_adventure)

    }
  },
}



$.each(temp,function(key,val){
  g_adventures[key] = val
})



overclockUnclickable = function(x_core){
  if(x_core.power >= g_max_core_power){
    return "已达到最大核心功率"
  }else{
    return false
  }
}








//
// Core CLick Support
//

changeFormArch = function(x_core, type,version){
  var x_process = {slug:'change_arch_'+x_core.slug, a: "正在改变架构", w: 50, c: function(){
      addBuffer(" "+x_core.title+" 的架构已更改为 <span class='exe'>"+type+" "+version+"</span>")
      x_core.architecture = type+"-"+version
      checkCoreArchOsAilment(x_core)
      addBuffer(coreClickString(x_core))
      writeBuffer()
    }
  }
  setProcessToCore(x_core, x_process)
}

changeFormOs = function(x_core, type, version){
  var x_process = {slug:'change_os_'+x_core.slug, a: "正在改变操作系统", w: 50, c: function(){
      addBuffer(" "+x_core.title+" 的操作系统已更改为 <span class='exe'>"+type+" "+version+"</span>")
      x_core.os = type+"-"+version
      checkCoreArchOsAilment(x_core)
      addBuffer(coreClickString(x_core))
      writeBuffer()
    }
  }
  setProcessToCore(x_core, x_process)
}

checkCoreArchOsAilment = function(x_core){
  var os = x_core.os,
      arch = x_core.architecture

  switch(os){
    case "MSDOS-16bit":
      if(arch == "x86-32bit" || arch == "x86-16bit")
        return rmCoreAilment(x_core, 'os_arch_mismatch')
    break;
    case "MSDOS-32bit":
      if(arch == "x86-32bit")
        return rmCoreAilment(x_core, 'os_arch_mismatch')
    break;
    case "Linux-16bit":
      if(arch == "x86-32bit" || arch == "x86-16bit")
        return rmCoreAilment(x_core, 'os_arch_mismatch')
    break;
    case "Linux-32bit":
      if(arch == "x86-32bit")
        return rmCoreAilment(x_core, 'os_arch_mismatch')
    break;
    case "Linux-32bit":
      if(arch == "x86-32bit")
        return rmCoreAilment(x_core, 'os_arch_mismatch')
    break;
    case "Solaris-32bit":
      if(arch == "SPARC-32bit")
        return rmCoreAilment(x_core, 'os_arch_mismatch')
    break
    case "CellOS-32bit":
      if(arch == "PowerPC-32bit")
        return rmCoreAilment(x_core, 'os_arch_mismatch')
    break
  }
  return addCoreAilment(x_core, 'os_arch_mismatch')
}
addCoreAilment = function(x_core, slug){
  if(!x_core.ailments.includes(slug)){
    x_core.ailments.push(slug)
  }
}

rmCoreAilment= function(x_core, slug){
  $.each(x_core.ailments, function(i,ailment){
    if(slug == ailment) x_core.ailments.splice(i,1)
  })
}


coreClickString = function(x_core){
  var a = x_core.os.split('-'),
    osTitle = a[0], osVersion = a[1],
    a = x_core.architecture.split('-'),
    archTitle = a[0], archVersion = a[1]


  var output = "<span class='exe'>"+x_core.title+"</span>"
  output += "<br>操作系统: "+osTitle+" "+osVersion
  output += "<br>CPU: "+archTitle+" "+archVersion
  output += "<br>速度: "+coreSpeedOutput(x_core)

  $.each(x_core.ailments, function(i,ailment){
    switch(ailment){
      case 'os_arch_mismatch':
        output += "<br>错误：不兼容的操作系统" 
    }
  })


  return output
}


coreSpeedOutput = function(x_core){
  return formatBytes(Math.pow(2,x_core.power + g_corepower - 2)*Math.pow(2,g_level_core)*100000, true)+"Hz"
}


coreClickableUpgradeOS = function(x_core){
  if(x_core.os == "MSDOS-16bit" && !g_os['MSDOS']['32bit'] && x_core.architecture == 'x86-32bit'){
    return "MSDOS-32bit"
  }else{
    return false
  }
}
