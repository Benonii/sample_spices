import { Edit, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export const CategoryEdit = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Name"}
          name={["name"]}
          rules={[
            {
              required: true,
              message: "Category name is required",
            },
          ]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>

        <Form.Item
          label={"Description"}
          name={["description"]}
        >
          <Input.TextArea 
            rows={3} 
            placeholder="Enter category description (optional)"
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
