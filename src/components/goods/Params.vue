<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部警告信息 -->
      <el-alert show-icon title="注意！仅可以为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>

      <!-- 选择商品分类的级联 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品的分类:</span>
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover' ,value:cateProps.value,label:cateProps.label,children:cateProps.children }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs 标签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showAddDialog"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand" label width="width">
              <template v-slot="scope">
                <el-tag
                  type="success"
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 新增tag组件 -->
                <!-- 输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 新增Tag按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#" width="width"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称" width="width"></el-table-column>
            <el-table-column label="操作" width="width">
              <template v-slot="scope">
                <el-button
                  icon="el-icon-edit"
                  type="primary"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  icon="el-icon-delete"
                  type="danger"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showAddDialog"
          >添加属性</el-button>
          <!--静态属性表格 -->
          <el-table :data="onlyTableData" style="width: 100%" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand" label width="width">
              <template v-slot="scope">
                <el-tag
                  type="success"
                  v-for="(item,index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 新增tag组件 -->
                <!-- 输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 新增Tag按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#" width="width"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称" width="width"></el-table-column>
            <el-table-column label="操作" width="width">
              <template v-slot="scope">
                <el-button
                  icon="el-icon-edit"
                  type="primary"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  icon="el-icon-delete"
                  type="danger"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数的对话框 -->
      <el-dialog
        :title="'添加'+ titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <!-- 添加参数的表单 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改参数的对话框 -->
      <el-dialog
        :title="'修改'+ titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <!-- 修改参数的表单 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有商品列表数据
      cateList: [],
      //   级联选择框的配置对象
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],

      // 激活的tabs标签
      activeName: "many",

      // 动态参数数据列表
      manyTableData: [],
      // 静态属性数据列表
      onlyTableData: [],

      // 控制添加参数对话框的显示与隐藏
      addDialogVisible: false,

      // 添加参数的表单数据对象
      addForm: {
        attr_name: "",
      },

      // 添加表单的数据验证规则对象
      addFormRules: {
        attr_name: [{ required: true, message: "请输入", trigger: "blur" }],
      },

      // 控制修改参数对话框的显示与隐藏
      editDialogVisible: false,

      //   修改参数的表单数据对象
      editForm: {},
      // 修改表单的数据验证规则对象
      editFormRules: {
        attr_name: [{ required: true, message: "请输入", trigger: "blur" }],
      },

      // 控制新增Tag输入框的显示与隐藏
      inputVisible: false,

      // 输入框Value的双向绑定数据
      inputValue: "",
    };
  },
  created() {
    //   获取所有商品列表数据
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表数据失败！");
      }

      this.cateList = res.data;
      //   console.log(this.cateList);
    },
    // 级联选择器中改变选择值触发的函数
    async handleChange() {
      this.getParamsData();
    },

    // tabs标签的点击事件触发函数
    handleTabClick() {
      // console.log(this.activeName);
      this.getParamsData();
    },

    // 获取参数列表数据的封装函数
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData=[];
        this.onlyTableData=[];
        return this.$message.error("您没有选择三级商品！");
      }

      //   console.log(this.selectedCateKeys);

      //   发起获取动态参数和静态属性的请求
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数数据列表失败！");
      }
      //   console.log(res.data);
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        // 绑定输入框的值
        item.inputValue = "";
        // 控制输入框的显示与隐藏
        item.inputVisible = false;
      });
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },

    // 监听添加参数按钮的事件，显示添加参数的对话框
    showAddDialog() {
      this.addDialogVisible = true;
    },

    // 监听添加参数对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
      this.addForm.attr_name = "";
    },
    // 点击确定按钮，添加参数的响应事件
    addParams() {
      this.$refs["addFormRef"].validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加参数失败！");
        }

        // 关闭添加参数对话框
        this.addDialogVisible = false;
        // 重新获取参数列表
        this.getParamsData();
        return this.$message.success("添加参数成功！");
      });
    },

    // 监听修改按钮的点击事件
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName,
          },
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("获取参数名称失败！");
      }
      console.log(res.data);
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改参数对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },

    // 点击确定按钮，触发修改参数的事件
    editParams() {
      this.$refs["editFormRef"].validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("修改参数名称失败！");
        }
        this.$message.success("修改参数名称成功！");
        // 关闭修改参数对话框
        this.editDialogVisible = false;
        // 重新获取参数列表数据
        this.getParamsData();
      });
    },

    // 删除按钮触发事件
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm(
        "此操作会永久删除该参数信息",
        "提示警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$$http.info("您已取消了删除操作");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("删除参数失败！");
      }

      this.$message.success("删除参数成功！");
      //   查询获取参数数据列表
      this.getParamsData();
    },

    // 点击新增tag按钮，显示Input输入框
    showInput(row) {
      // 显示输入框
      row.inputVisible = true;
      // 让输入框自动获得焦点
      // this.$nextTick方法 指页面上的元素被重新渲染时才会触发的回调函数
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    // 输入框enter按键弹起时和输入框失去焦点时的触发事件
    handleInputConfirm(row) {
      // 如果用户没有输入任何的值或为空字符串
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }

      // 如果不触发return 则证明用户输入了值，则触发新增事件
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;

      // 调用savaAttrVals事件
      this.savaAttrVals(row);
    },

    async savaAttrVals(row){
      // 将新Tag的值写入到后台数据库中
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name:row.attr_name,
        attr_sel:row.attr_sel,
        attr_vals:row.attr_vals.join(' ')
      })

      if(res.meta.status!==200){
        return this.$message.error('修改参数属性失败！')
      }
      this.$message.success('修改参数属性成功！')
    },

    // Tag标签关闭事件
    handleClose(i,row){
      // 删除对应的Tag
      row.attr_vals.splice(i,1);
      this.savaAttrVals(row);
    }
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[this.selectedCateKeys.length - 1];
      }
      return null;
    },
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    },
  },
};
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>