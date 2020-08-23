<template>
  <div class="login_container" >
      <div class="login_box">
          <!-- 头像区域 -->
          <div class="avatar_box">
              <img src="../assets/logo.png" alt="">
          </div>
          <!-- 登录区域 -->
          <el-form label-width="0" ref="loginFormRef" :rules="loginFormRules" class="login_form" :model="loginForm">
              <!-- 用户名 -->
               <el-form-item prop="username">
                   <el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
               </el-form-item>
               <!-- 密码-->
               <el-form-item prop="password">
                   <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input>
               </el-form-item>
               <el-form-item class="btns">
               <!-- 登录按钮 -->
                   <el-button type="primary" @click="submitForm('loginFormRef')">登录</el-button>
               <!-- 重置按钮 -->
                   <el-button type="info" @click="resetLoginForm('loginFormRef')">重置</el-button>
               </el-form-item>
          </el-form>
      </div>
  </div>
</template>

<script>
export default {
    data () {
        return {
            // 这是登录表单的数据绑定对象
            loginForm:{
                username:'',
                password:''
            },
            // 这是登录数据的验证规则对象
           loginFormRules:{
            //    验证用户名是否合法
               username:[
                   { required: true, message: '请输入用户名', trigger: 'blur' },
                   { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
               ],
            //    验证密码是否合法
               password:[
                   { required: true, message: '请输入密码', trigger: 'blur' },
                   { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
               ]
           } 
        }
    },
    methods: {
        // 点击登录按钮，验证登录表单数据
        submitForm(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            const{data:res}=await this.$http.post("login",this.loginForm);
            console.log(res);
            if(res.meta.status==200){
                this.$message.success('登陆成功')
                // 1.将登录成功之后的token，保存到客户端的sessionStorage中
                //  1.1 项目组除了登录之外的其他API接口，必须在登陆之后才能访问
                //  1.2 token只应在当前网站打开期间生效，所以讲token保存在sessionStorage中
                window.sessionStorage.setItem('token',res.data.token);
                // 2.通过编程式导航跳转到后台主页，路由地址是/home
                this.$router.push('/home');
            }else{
                // console.log('登陆失败');
                this.$message.error('登陆失败')
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
        // 点击重置按钮，重置登录表单
        resetLoginForm(formName){
            // console.log(this);
            this.$refs[formName].resetFields();
        }
    }
}
</script>

<style lang="less" scoped>
    .login_container{
        background-color: #2b4b6b;
        height: 100%;
    }

    .login_box{
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);

        .avatar_box{
            position: absolute;
            top: 0;
            left: 50%;
            transform: translate(-50%,-50%);
            height: 130px;
            width: 130px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            background-color: #fff;
            img{
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #eee;
            }
        }

        .login_form{
            position: absolute;
            bottom: 0;
            width: 100%;;
            padding: 0 20px;
            box-sizing: border-box;
        }
        .btns{
            display: flex;
            justify-content: flex-end;
        }
    }

</style>