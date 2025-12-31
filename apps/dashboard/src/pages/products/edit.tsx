import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, TextArea, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import { useState } from "react";

export const ProductEdit = () => {
  const { formProps, saveButtonProps } = useForm({});
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const { selectProps: categorySelectProps } = useSelect({
    resource: "category",
    optionLabel: "name",
    optionValue: "id",
  });

  // Function to get presigned URL and upload image
  const handleImageUpload = async (file: RcFile): Promise<string> => {
    try {
      setUploading(true);
      
      // Get presigned URL from backend
      const presignedResponse = await fetch('http://localhost:5000/api/upload/presigned_url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      });
      
      if (!presignedResponse.ok) {
        throw new Error('Failed to get presigned URL');
      }
      
      const presignedData = await presignedResponse.json();
      
      // Upload file to Supabase using presigned URL
      const uploadResponse = await fetch(presignedData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      // Construct the public URL manually using the storage key
      const publicUrl = `https://tyjuxlxgsymcicxsazzi.supabase.co/storage/v1/object/public/product_images/${presignedData.storageKey}`;
      
      // Return the image data in the format expected by backend
      return JSON.stringify({
        storageKey: presignedData.storageKey,
        fileName: file.name,
        imageUrl: publicUrl,
        imagePath: presignedData.path,
        isPrimary: uploadedImages.length === 0, // First image is primary
        orderIndex: uploadedImages.length
      });
      
    } catch (error) {
      message.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label={"Name"}
          name={["name"]}
          rules={[
            {
              required: true,
              message: "Product name is required",
            },
          ]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item
          label={"Description"}
          name={["description"]}
          rules={[
            {
              required: true,
              message: "Product description is required",
            },
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Enter product description"
          />
        </Form.Item>

        <Form.Item
          label={"Price"}
          name={["price"]}
          rules={[
            {
              required: true,
              message: "Price is required",
            },
            {
              type: "number",
              min: 0,
              message: "Price must be a positive number",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="0.00"
            precision={2}
            min={0}
            prefix="$"
          />
        </Form.Item>

        <Form.Item
          label={"Inventory"}
          name={["inventory"]}
          rules={[
            {
              required: true,
              message: "Inventory quantity is required",
            },
            {
              type: "number",
              min: 0,
              message: "Inventory must be a non-negative number",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="0"
            min={0}
            precision={0}
          />
        </Form.Item>

        <Form.Item
          label={"Category"}
          name={["categoryID"]}
          rules={[
            {
              required: true,
              message: "Category is required",
            },
          ]}
        >
          <Select
            placeholder="Select a category"
            {...categorySelectProps}
          />
        </Form.Item>

        <Form.Item
          label={"Status"}
          name={["status"]}
          rules={[
            {
              required: true,
              message: "Status is required",
            },
          ]}
        >
          <Select>
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="INACTIVE">Inactive</Select.Option>
            <Select.Option value="ARCHIVED">Archived</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={"Product Images"}
          name={["images"]}
        >
          <Upload
            listType="picture-card"
            maxCount={5}
            multiple={true}
            accept="image/*"
            beforeUpload={async (file) => {
              const isImage = file.type.startsWith('image/');
              if (!isImage) {
                message.error('You can only upload image files!');
                return false;
              }
              const isLt5M = file.size / 1024 / 1024 < 5;
              if (!isLt5M) {
                message.error('Image must be smaller than 5MB!');
                return false;
              }
              
              try {
                const imageData = await handleImageUpload(file);
                const parsedImageData = JSON.parse(imageData);
                
                // Add to uploaded images state
                setUploadedImages(prev => [...prev, parsedImageData]);
                
                // Update form field with the uploaded image data
                const currentImages = formProps.form?.getFieldValue('images') || [];
                formProps.form?.setFieldValue('images', [...currentImages, parsedImageData]);
                
                message.success(`${file.name} uploaded successfully!`);
              } catch (error) {
                message.error(`Failed to upload ${file.name}`);
              }
              
              return false; // Prevent default upload behavior
            }}
            onChange={(info) => {
              if (info.file.status === 'removed') {
                // Handle file removal
                const currentImages = formProps.form?.getFieldValue('images') || [];
                const fileToRemove = info.file as any;
                const filteredImages = currentImages.filter((img: any) => 
                  img.storageKey !== fileToRemove.storageKey && img.uid !== fileToRemove.uid
                );
                formProps.form?.setFieldValue('images', filteredImages);
                
                // Also update uploaded images state
                setUploadedImages(prev => 
                  prev.filter(img => img.storageKey !== fileToRemove.storageKey)
                );
              }
            }}
            fileList={uploadedImages.map((img, index) => ({
              uid: img.storageKey || `img-${index}`,
              name: img.fileName,
              status: 'done',
              url: img.imageUrl,
              thumbUrl: img.imageUrl,
              storageKey: img.storageKey
            }))}
            itemRender={(originNode, file, fileList, { remove }) => (
              <div style={{ position: 'relative' }}>
                {originNode}
                <Button
                  type="text"
                  size="small"
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: '0',
                    color: '#ff4d4f',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    minWidth: '20px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => remove()}
                >
                  ×
                </Button>
              </div>
            )}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              padding: '8px'
            }}>
              <UploadOutlined style={{ fontSize: '16px', marginBottom: '4px' }} />
              <span style={{ fontSize: '12px' }}>Upload</span>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Edit>
  );
};
