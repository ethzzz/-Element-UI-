<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="400" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- Tab栏区域 -->
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 选择商品分类的级联 -->
              <el-row class="cat_opt">
                <el-col>
                  <span>选择商品的分类:</span>
                  <el-cascader
                    v-model="addForm.goods_cat"
                    :options="cateList"
                    :props="{ expandTrigger: 'hover' ,value:cateProps.value,label:cateProps.label,children:cateProps.children }"
                    @change="handleChange"
                    size="medium"
                  ></el-cascader>
                </el-col>
              </el-row>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item2" v-for="(item2,index) in item.attr_vals" :key="index"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
              <quill-editor v-model="addForm.goods_introduce">
              </quill-editor>
              <!-- 添加商品按钮 -->
              <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="30%">
      <img :src="previewPath" alt="商品图片" style="width:100%" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: "0",

      //   添加商品的表单数据对象
      addForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        // 商品所属的分类数组
        goods_cat: [],
        // 图片数组
        pics: [],
        // 商品详情描述
        goods_introduce:'',
        // 参数数组
        attrs:[]
      },
      // 添加商品的表单数据验证对象
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请输入商品分类", trigger: "blur" },
        ],
      },

      //   获取的所有商品分类列表数据
      cateList: [],

      //   级联选择器绑定的数据对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },

      //   动态参数列表
      manyTableData: [],

      //   静态属性列表
      onlyTableData: [],

      // 图片上传的地址
      uploadURL: "http://timemeetyou.com:8889/api/private/v1/upload",

      //   图片上传的headers请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },

      // 图片的绝对路径
      previewPath: "",

      // 图片预览对话框的显示与隐藏
      previewVisible:false,
    };
  },
  created() {
    //   获取所有分类列表数据
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表数据失败!");
      }
      // 把获取的商品列表赋值到 cateList中
      this.cateList = res.data;
      //   console.log(this.cateList)
    },

    // 级联选择器选中值发生变化触发的函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
        return this.$message.error("您没有选择三级商品分类！");
      }
      //   console.log(this.addForm.goods_cat);
    },

    // Tab栏切换触发的事件
    beforeTabLeave(avtiveName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    },
    // --Tab栏点击事件
    async tabClicked() {
      // console.log(this.activeIndex)
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many",
            },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数数据列表失败！");
        }
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        });
        this.manyTableData = res.data;
        // console.log(res.data);
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only",
            },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取属性数据列表失败！");
        }
        this.onlyTableData = res.data;
        // console.log(res.data);
      }
    },

    // --处理图片预览效果
    handlePreview(file) {
      // console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    //   console.log(this.previewPath)
    },
    // --处理图片删除效果
    handleRemove(file) {
      // 1.获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2.根据临时路径，找到此图片对应 pics 数组中的索引值
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      // 3.根据索引值，删除对应的图片信息
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 图片上传成功时的触发事件
    handleSuccess(response) {
      // console.log(response)
      // 拼接得到一个图片信息对象
      const picsInfo = {
        pic: response.data.tmp_path,
      };
      // 将图片信息push到 pics 数组中
      this.addForm.pics.push(picsInfo);
      //   console.log(this.addForm);
    },
    // 添加商品
    add(){
        // console.log(this.addForm)
        // --进行表单的预验证
        this.$refs['addFormRef'].validate(async(valid) => {
            if (!valid) {
                return this.$message.error('请填写必要的表单项')
            }

            // 执行添加商品的业务逻辑
            const form = _.cloneDeep(this.addForm)
            // lodash cloneDeep(Value) 深拷贝
            form.goods_cat = form.goods_cat.join(',');

            // 处理动态参数
            this.manyTableData.forEach(item=>{
                const newInfo = {
                    attr_id : item.attr_id,
                    attr_value : item.attr_vals.join(' '),
                }
                this.addForm.attrs.push(newInfo)
            })

            // 处理静态属性
            this.onlyTableData.forEach(item=>{
                const newInfo = {
                    attr_id : item.attr_id,
                    attr_value : item.attr_vals
                }
                this.addForm.attrs.push(newInfo)
            })
            form.attrs = this.addForm.attrs
            // console.log(form);

            // --商品的名称必须是唯一的

            const {data:res}  =await this.$http.post('goods',form)

            if(res.meta.status!==201){
                return this.$message.error('添加商品失败！')
            }
            this.$message.success('添加商品成功！')
            // --跳转到商品列表页面
            this.$router.push('/goods');
        })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
.btnAdd{
    margin-top: 15px;
}
</style>