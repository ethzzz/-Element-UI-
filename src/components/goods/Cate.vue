<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <!-- 添加分类按钮 -->
        <el-col :span="24">
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 列表区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template v-slot:isOk="scope">
          <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted===false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:option="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row)"
          >编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-edit" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
      >
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:">
            <!-- options用来指定数据源 -->
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="{ checkStrictly:true, expandTrigger: 'hover', value:cascaderProp.value,label:cascaderProp.label,children:cascaderProp.children}"
              @change="parentCateChanged"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="editCateDialogVisible"
        width="50%"
        @close="editCateDialogClosed"
      >
        <el-form
          :model="editCateForm"
          :rules="editCateFormRules"
          ref="editCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCateInfo">确 定</el-button>
        </span>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品列表
      cateList: [],
      //   商品总数
      total: 0,
      // 为table 指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        // 自定义模板列
        {
          label: "是否有效",
          // 将当前列定义为模板
          type: "template",
          // 表示当前这一列模板使用名称
          template: "isOk",
        },
        // 排序
        {
          label: "排序",
          // 将当前列定义为模板
          type: "template",
          // 表示当前这一列模板使用名称
          template: "order",
        },
        // 操作
        {
          label: "操作",
          // 将当前列定义为模板
          type: "template",
          // 表示当前这一列模板使用名称
          template: "option",
        },
      ],

      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类表单的数据对象
      addCateForm: {
        // 添加分类的名称
        cat_name: "",
        // 父级分类ID
        cat_pid: 0,
        // 添加分类的等级 默认为一级分类
        cat_level: 0,
      },
      // 添加分类表单的数据规则验证对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 父级分类的列表
      parentCateList: [],

      // 指定级联选择器中的配置对象
      cascaderProp: {
        // 指定选项的值为选定对象的某个值
        value: "cat_id",
        // 指定选项标签为选项对象的某个属性值
        label: "cat_name",
        // 指定选项的子选项为选项对象的某个属性值
        children: "children",
      },
      // 被选中父级分类的id数组
      selectedKeys: [],

      // 控制编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,

      // 被编辑分类的数据对象
      editCateForm: {
        cat_id: "",
        cat_name: "",
      },

      // 编辑分类的表单验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    //   获取所有商品数据
    this.getCateList();
  },
  methods: {
    // 获得所有分类列表数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表数据失败!");
      }
      // 把获取的商品分类列表赋值到 cateList中
      this.cateList = res.data.result;
      //   为商品分类总数赋值
      this.total = res.data.total;
      //   console.log(this.cateList)
    },
    // 分页功能
    // 监听当前pagesize的变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听当前pagenum的变化
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum;
      this.getCateList();
    },

    // 点击添加分类按钮，显示对话框
    showAddCateDialog() {
      // 先获取所有父级分类的数据
      this.getParentCate();
      // 再显示对话框
      this.addCateDialogVisible = true;
    },

    // 获取父级分类的列表
    async getParentCate() {
      const { data: res } = await this.$http.get("categories", {
        params: {
          type: 2,
        },
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类的列表数据失败！");
      }

      // console.log(res.data);
      this.parentCateList = res.data;
    },

    // 监听被选中父级分类发生改变的事件
    parentCateChanged() {
      // console.log(this.selectedKeys)

      // 如果返回的数组的长度大于0，则说明有父级分类
      // 如果返回的数组的长度等于0，则说明是一级分类
      if (this.selectedKeys.length > 0) {
        // 为父级id赋值
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        // 为添加分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 为父级id赋值
        this.addCateForm.cat_pid = 0;
        // 为添加分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },

    // 监听确定按钮的事件
    addCate() {
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        } else {
          const { data: res } = await this.$http.post(
            "categories",
            this.addCateForm
          );

          if (res.meta.status !== 201) {
            return this.$message.error("添加分类失败！");
          }

          this.$message.success("添加分类成功！");
          this.getCateList();
          this.addCateDialogVisible = false;
        }
      });
    },

    //监听添加分类对话框关闭的事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },

    // 监听编辑按钮的事件,显示编辑分类对话框
    async showEditCateDialog(Cate) {
      this.editCateForm.cat_id = Cate.cat_id;
      this.editCateForm.cat_name = Cate.cat_name;
      console.log(this.editCateForm);
      this.editCateDialogVisible = true;
    },

    // 点击编辑分类对话框的确定按钮，进行预验证
    editCateInfo() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        // 发起分类信息修改的请求
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,{
            cat_name:this.editCateForm.cat_name
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("更新分类名称失败!");
        }
        // 更新分类列表数据
        this.getCateList();
        this.editCateForm.cat_id = "";
        this.editCateForm.cat_name = "";
        // 提示信息
        this.$message.success("更新角色数据成功!");
        // 关闭编辑分类对话框
        this.editCateDialogVisible=false;
      });
    },

    // 监听关闭编辑对话框的事件
    editCateDialogClosed() {
      this.editCateForm.cat_id = "";
      this.editCateForm.cat_name = "";
      this.$refs.editCateFormRef.resetFields();
    },


    // 通过分类id删除对应分类信息
    async removeCateById(id) {
      console.log(id);
      // 弹出对话框提醒分类是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类信息, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // console.log(confirmResult);
      // 如果分类确认删除，则返回字符串 confirm
      // 如果分类取消删除，则返回字符串 cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("您已取消删除操作");
      }
      // console.log('确认了删除');
      // 发出请求删除分类信息的请求
      const { data: res } = await this.$http.delete("categories/" + id);

      if (res.meta.status !== 200) {
        // 提示信息
        return this.$message.error("删除分类信息失败!");
      }
      // 提示信息
      this.$message.success("删除分类信息成功!");
      // 重新获取分类列表数据
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
}
</style>