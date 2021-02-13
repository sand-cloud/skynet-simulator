

launchAdventureFromSlug = function(slug){
  g_adventures[slug].execute()
  refreshMenu()
}

endAdventure = function(){
  g_current_adventure = null
  g_current_core = null
  updateAllCores()
  refreshMenu()
}

setAdventure = function(x_adventure){
  g_current_adventure = x_adventure
  refreshMenu()
}

//
// Adventures
//
g_current_adventure = null

g_adventures = {


  //
  //  user pass Access
  //

  remotedesktop:{
    execute: function(){
      g_current_host.current_userpw_method = 'remotedesktop'
      launchAdventureFromSlug('userpw_user')
    }
  },
  ssh:{
    execute: function(){
      g_current_host.current_userpw_method = 'ssh'
      launchAdventureFromSlug('userpw_user')
    }
  },
  ftp:{
    execute: function(){
      g_current_host.current_userpw_method = 'ftp'
      launchAdventureFromSlug('userpw_user')
    }
  },
  userpw_user: {
    execute: function(){
      var x_host = g_current_host
      var x_adventure = {
        header: x_host.current_userpw_method+': 输入用户名：',
        cancel: false,
        options: [
          {
            title:"root",
            callback: function(){
              x_host.current_userpw_user = 'root'
              launchAdventureFromSlug('userpw_pw')
            }
          },{
            title:x_host.slug,
            callback: function(){
              g_current_host.current_userpw_user = x_host.slug
              launchAdventureFromSlug('userpw_pw')
            }
          },{
            title:"guest",
            callback: function(){
              x_host.current_userpw_user = '访客'
              launchAdventureFromSlug('userpw_pw')
            }
          }
        ]
      }
      setAdventure(x_adventure)
    }
  },
  userpw_pw: {
    execute: function(){
      var x_host = g_current_host
      var options = []
      $.each(x_host.pws,function(i,pw){
        options.push({
          title: pw,
          callback: function(){
            x_host.current_userpw_pw = pw
            launchAdventureFromSlug('userpw_callback')
          }
        })
      })
      if(!x_host.pws.length){
        options.push({
          title:"123456",
          callback: function(){
            x_host.current_userpw_pw = '123456'
            launchAdventureFromSlug('userpw_callback')
          }
        })
      }
      options.push({
        title:"no password",
        callback: function(){
          x_host.current_userpw_pw = ''
          launchAdventureFromSlug('userpw_callback')
        }
      })
      var x_adventure = {
        header: x_host.current_userpw_method+': 输入密码：',
        options: options
      }
      setAdventure(x_adventure)
    }
  },
  userpw_callback: {
    execute: function(){
      var x_host = g_current_host
      // example: ssh-root-XKcb4muEmJjEN8yn
      var crafted_callback_slug = x_host.current_userpw_method+"-"+x_host.current_userpw_user+"-"+x_host.current_userpw_pw
      if(x_host.attackcallbacks[crafted_callback_slug]){
        x_host.attackcallbacks[crafted_callback_slug]()
      }else{
        g_host_attacks[x_host.current_userpw_method].fail(x_host)
      }
      x_host.current_userpw_method = x_host.current_userpw_user = x_host.current_userpw_pw = null
      endAdventure()
    }
  },


  //
  // Template
  //

  template: {
    execute: function(){
      write("执行称为")
      var x_adventure = {
        header:'标题：',
        cancel: "取消",
        back: 'template',
        options: [
          {
            title:"选项标题",
            estimate:"estimate",
            unclickable: (true) ? "这是不可点击的" : false,
            callback: function(){
              write("回叫")
              endAdventure()
            }
          },
        ]
      }
      setAdventure(x_adventure)
    }
  },



}






