<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加用户按钮 -->
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="addRolesDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <!-- 展开列  -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['borderBottom',index1===0?'borderTop':'','vcenter']"
              v-for="(item1 , index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  type="primary"
                  closable
                  @close="removeRightById(scope.row,item1.id)"
                >{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <!-- 二级循环渲染权限 -->
                <el-row
                  :class="[index2===0?'':'borderTop','vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-info"
              @click="showEditRolesDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="addRolesDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        ref="addRolesFormRef"
        :model="addRolesForm"
        :rules="addRolesFormRules"
        label-width="80px"
      >
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addRolesDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="修改角色信息"
      :visible.sync="editRolesDialogVisible"
      width="50%"
      @close="editRolesDialogClosed"
    >
      <el-form
        :model="editRolesForm"
        :rules="editRolesFormRules"
        ref="editRolesFormRef"
        label-width="90px"
      >
        <el-form-item label="角色ID" prop="roleId">
          <el-input v-model="editRolesForm.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //  角色列表数据
      rolesList: [],
      //   权限列表数据
      rightsList: [],
      //   树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      //   默认被选中的节点
      defKeys: [],
      //   即将分配权限的当前角色
      roleId: "",
      // 控制添加角色对话框的显示与隐藏
      addRolesDialogVisible: false,
      addRolesForm: {
        roleName: "",
        roleDesc: "",
      },
      //   添加角色表单验证规则
      addRolesFormRules: {
        rolesName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        rolesDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
      },

      //   查询到的角色对象
      editRolesForm: {},

      // 控制编辑角色对话框的显示与隐藏
      editRolesDialogVisible: false,

      // 编辑角色表单数据验证规则
      editRolesFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
      },

      //   控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
    };
  },
  created() {
    // 获取所有角色列表数据
    this.getRolesList();
  },
  methods: {
    //   获取所有角色列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("获取用户权限列表失败!");
      }

      this.rolesList = res.data;
      console.log(this.rolesList);
    },

    // 监听添加角色对话框的关闭事件
    addRolesDialogClosed() {
      this.$refs.addRolesFormRef.resetFields();
    },

    // 点击确定按钮，进行表单的预校验
    addRoles() {
      this.$refs["addRolesFormRef"].validate(async (valid) => {
        if (!valid) {
          return;
        }
        // 可以发起添加角色的请求
        const { data: res } = await this.$http.post("roles", this.addRolesForm);
        if (res.meta.status !== 201)
          return this.$message.error("添加角色失败！");
        this.$message.success("添加角色成功！");
        // 隐藏用户对话框
        this.addRolesDialogVisible = false;
        // 重新获取用户列表数据
        this.getRolesList();
      });
    },

    // 监听编辑角色信息对话框的关闭事件
    editRolesDialogClosed() {
      this.$refs.editRolesFormRef.resetFields();
    },
    // 点击编辑按钮，显示编辑角色信息对话框
    async showEditRolesDialog(id) {
      // console.log(id);
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色数据失败!");
      }
      this.editRolesDialogVisible = true;
      this.editRolesForm = res.data;
      //   console.log(this.editRolesForm);
    },
    // 点击编辑对话框的确定按钮，进行预验证
    editRolesInfo() {
      this.$refs["editRolesFormRef"].validate(async (valid) => {
        if (!valid) {
          return;
        }
        // 发起角色信息修改的请求
        const { data: res } = await this.$http.put(
          "roles/" + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc,
          }
        );
        // console.log(res.meta.status);
        if (res.meta.status !== 200) {
          return this.$message.error("更新角色数据失败!");
        }
        // 关闭修改角色信息对话框
        this.editRolesDialogVisible = false;
        // 更新角色列表数据
        this.getRolesList();
        // 提示信息
        this.$message.success("更新角色数据成功!");
      });
    },

    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = [];
    },
    // 点击分配权限按钮，显示分配权限对话框
    async showSetRightDialog(role) {
      // 为即将分配权限用户ID保存到 roleId中
      this.roleId = role.id;
      // 获取所有权限列表
      const { data: res } = await this.$http.get("rights/tree");

      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表数据失败!");
      }
      // 将获取到的权限数据保存到rightsList中
      this.rightsList = res.data;
      //   console.log(this.rightsList);

      // 递归获取三级权限的节点
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },

    // 通过角色id删除对应角色信息
    async removeRolesById(id) {
      // console.log(id);
      // 弹出对话框提醒用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色信息, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      // console.log(confirmResult);
      // 如果用户确认删除，则返回字符串 confirm
      // 如果用户取消删除，则返回字符串 cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("您已取消删除操作");
      }
      // console.log('确认了删除');
      // 发出请求删除用户信息的请求
      const { data: res } = await this.$http.delete("roles/" + id);

      if (res.meta.status !== 200) {
        // 提示信息
        return this.$message.error("删除角色信息失败!");
      }
      // 提示信息
      this.$message.success("删除角色信息成功!");
      // 重新获取用户列表数据
      this.getRolesList();
    },

    // 根据id删除对应权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户信息, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("您已取消删除操作");
      }
      //   console.log('您确定了删除')
      // console.log(roleId,rightId);
      // 发出请求删除角色权限的请求
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        // 提示信息
        return this.$message.error("删除角色权限失败!");
      }
      // 提示信息
      this.$message.success("删除角色权限成功!");
      // 重新获取用户列表数据
      //   this.getRolesList();
      role.children = res.data;
    },

    // 通过递归的方式，获取角色下的所有三级权限的id，并保存到 defKeys中
    getLeafKeys(node, arr) {
      // 如果当前的节点不包含children属性，则为三级权限
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach((item) => this.getLeafKeys(item, arr));
    },

    // 点击确定按钮， 为用户分配权限
    async allotRight() {
      const Keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      // console.log(Keys);

      const isStr = Keys.join(",");
      // console.log(isStr);

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: isStr,
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("分配角色权限失败!");
      }

      this.$message.success("分配角色权限成功");
      //   关闭分配权限对话框
      this.setRightDialogVisible = false;
      // 重新获取最新的角色权限数据
      this.getRolesList();
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.borderTop {
  border-top: 1px solid #eee;
}

.borderBottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>>
