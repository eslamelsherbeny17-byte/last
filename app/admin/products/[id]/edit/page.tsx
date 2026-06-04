import ProductForm from '@/components/admin/ProductForm'

export default function EditPage({ params }: { params: { id: string } }) {
  return <ProductForm params={params} /> // هنا نمرر الـ ID ليعرف الكود أننا في وضع التعديل
}