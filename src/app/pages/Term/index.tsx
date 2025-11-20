"use client";

import { Card } from "antd";
import { useState } from "react";

export default function TermsOfService() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "section-1",
  ]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: "section-1",
      title: "1. Điều khoản sử dụng chung",
      content: `EVTradeHub ("Nền tảng") là một thị trường điện tử kết nối những người mua và bán xe điện (EV) và pin. Bằng việc sử dụng nền tảng này, bạn đồng ý tuân theo các điều khoản và điều kiện này.

Nền tảng được cung cấp "như hiện tại" mà không có bất kỳ bảo đảm nào. Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại trực tiếp hoặc gián tiếp phát sinh từ việc sử dụng nền tảng.`,
    },
    {
      id: "section-2",
      title: "2. Đăng ký và quản lý tài khoản",
      content: `Để sử dụng nền tảng, bạn phải đăng ký một tài khoản. Bạn có thể đăng ký qua email, số điện thoại, hoặc tài khoản mạng xã hội.

Bạn chịu trách nhiệm duy trì bảo mật thông tin đăng nhập của mình. Tất cả các hoạt động dưới tài khoản của bạn là trách nhiệm của bạn. Bạn phải cung cấp thông tin chính xác, đầy đủ và không có gì sai lệch khi đăng ký.`,
    },
    {
      id: "section-3",
      title: "3. Đăng tin bán xe/pin",
      content: `Khi đăng tin bán, bạn cam kết rằng:
- Bạn có quyền pháp lý để bán sản phẩm
- Tất cả thông tin trong tin đăng là chính xác và đầy đủ
- Hình ảnh và thông số kỹ thuật phản ánh tình trạng thực tế của sản phẩm
- Sản phẩm không bị tranh chấp pháp lý hoặc bị cấm bán

Chúng tôi có quyền xóa bất kỳ tin đăng nào vi phạm chính sách nội dung của chúng tôi mà không cần thông báo trước.`,
    },
    {
      id: "section-4",
      title: "4. Tìm kiếm và mua hàng",
      content: `Nền tảng cung cấp các công cụ tìm kiếm và lọc để giúp bạn tìm xe/pin phù hợp. Bạn có thể:
- Tìm kiếm theo hãng, đời, dung lượng pin, giá, tình trạng pin, số km, năm sản xuất, v.v.
- Theo dõi tin yêu thích
- So sánh nhiều sản phẩm

Các thông tin tìm kiếm chỉ mang tính chất tham khảo. Chúng tôi không bảo đảm tính chính xác của tất cả thông tin được liệt kê.`,
    },
    {
      id: "section-5",
      title: "5. Đấu giá và mua ngay",
      content: `EVTradeHub hỗ trợ hai hình thức mua:

A. Mua ngay:
- Giá được bán hàng đề bạo ghi
- Khi bạn bấm "Mua ngay", đơn hàng được tạo ngay lập tức
- Bạn phải thanh toán trong vòng thời gian quy định

B. Đấu giá:
- Bạn có thể đặt giá khởi điểm, mức giá dự trữ, mức tăng giá tối thiểu
- Người bán phải phê duyệt phiên đấu giá trước khi bắt đầu
- Đấu giá kéo dài trong khoảng thời gian quy định
- Người đặt giá cao nhất tại thời điểm kết thúc sẽ thắng
- Hãy tuân theo các quy tắc phòng chống quét giá (anti-sniping)`,
    },
    {
      id: "section-6",
      title: "6. Thanh toán",
      content: `Thanh toán được thực hiện thông qua các kênh sau:
- Ví điện tử (E-wallet)
- Chuyển khoản ngân hàng
- Các phương thức thanh toán khác do chúng tôi hỗ trợ

Khi bạn thanh toán, bạn đồng ý rằng:
- Thông tin thanh toán của bạn là chính xác
- Bạn có quyền sử dụng phương thức thanh toán này
- Giao dịch sẽ được xử lý theo các điều khoản của nhà cung cấp thanh toán

Chúng tôi không lưu trữ thông tin thẻ tín dụng hoặc chi tiết tài khoản ngân hàng.`,
    },
    {
      id: "section-7",
      title: "7. Hợp đồng mua bán số hóa",
      content: `Tất cả các giao dịch mua bán trên nền tảng được ký kết thông qua hợp đồng số hóa. Hợp đồng này:
- Bao gồm chi tiết sản phẩm, giá, điều khoản giao hàng
- Được ký điện tử bởi cả hai bên
- Có giá trị pháp lý như hợp đồng truyền thống

Bạn đồng ý rằng hợp đồng số hóa là ràng buộc và có thể thực thi được.`,
    },
    {
      id: "section-8",
      title: "8. Hỗ trợ sau bán",
      content: `Sau khi giao dịch hoàn tất:

A. Đánh giá và phản hồi:
- Cả người mua và người bán có thể đánh giá nhau
- Đánh giá phải trung thực, tôn trọng và không chứa nội dung sai lệch
- Chúng tôi có quyền xóa những đánh giá vi phạm chính sách

B. Lịch sử giao dịch:
- Cả hai bên có thể xem lịch sử giao dịch
- Chúng tôi giữ lại tất cả thông tin giao dịch cho mục đích quản lý tranh chấp`,
    },
    {
      id: "section-9",
      title: "9. Báo cáo sự cố và xử lý tranh chấp",
      content: `Nếu bạn gặp sự cố với giao dịch:
- Vui lòng liên hệ với bên kia để giải quyết trong vòng 24 giờ
- Nếu không giải quyết được, hãy báo cáo cho chúng tôi với bằng chứng
- Chúng tôi sẽ điều tra và ra quyết định trong vòng 7 ngày làm việc

Chúng tôi có thể:
- Yêu cầu hoàn lại tiền
- Yêu cầu hoàn trả sản phẩm
- Cấm người dùng vi phạm khỏi nền tảng`,
    },
    {
      id: "section-10",
      title: "10. Bảo vệ người tiêu dùng",
      content: `Chúng tôi cam kết bảo vệ người tiêu dùng bằng cách:
- Xác minh thông tin người bán
- Hỗ trợ giải quyết tranh chấp công bằng
- Bảo vệ thông tin cá nhân của bạn
- Tuân thủ tất cả các luật bảo vệ người tiêu dùng hiện hành

Nếu bạn cảm thấy quyền của mình bị vi phạm, hãy liên hệ với chúng tôi ngay.`,
    },
    {
      id: "section-11",
      title: "11. Quyền riêng tư và bảo vệ dữ liệu",
      content: `Chúng tôi cam kết bảo vệ dữ liệu cá nhân của bạn:
- Tất cả dữ liệu được mã hóa và lưu trữ an toàn
- Chúng tôi không chia sẻ dữ liệu với bên thứ ba mà không có sự đồng ý
- Bạn có quyền truy cập, sửa đổi, và xóa dữ liệu cá nhân của mình
- Chúng tôi tuân thủ các quy định bảo vệ dữ liệu như GDPR`,
    },
    {
      id: "section-12",
      title: "12. Hạn chế trách nhiệm",
      content: `Trong phạm vi tối đa được pháp luật cho phép, chúng tôi không chịu trách nhiệm về:
- Bất kỳ thiệt hại gián tiếp, ngẫu nhiên, hoặc hậu quả
- Mất dữ liệu, tổn thất lợi nhuận, hoặc gián đoạn kinh doanh
- Chất lượng hoặc tính phù hợp của sản phẩm được bán trên nền tảng

Tổng trách nhiệm của chúng tôi không vượt quá số tiền bạn đã trả cho giao dịch.`,
    },
    {
      id: "section-13",
      title: "13. Điều khoản sử dụng chung",
      content: `Bạn đồng ý không:
- Sử dụng nền tảng để bất kỳ mục đích bất hợp pháp nào
- Gửi nội dung độc hại, xúc phạm, hoặc gây quấy rối
- Tạo nhiều tài khoản để tránh hạn chế
- Cố gắng hack hoặc phá vỡ an ninh của nền tảng
- Vi phạm bất kỳ quyền sở hữu trí tuệ nào

Chúng tôi có quyền đình chỉ hoặc xóa tài khoản của bạn mà không cần cảnh báo.`,
    },
    {
      id: "section-14",
      title: "14. Thay đổi điều khoản",
      content: `Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. Những thay đổi sẽ có hiệu lực 30 ngày sau khi được đăng trên nền tảng.

Sử dụng tiếp tục nền tảng của bạn sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.`,
    },
    {
      id: "section-15",
      title: "15. Liên hệ",
      content: `Nếu bạn có bất kỳ câu hỏi hoặc lo ngại về các điều khoản này, vui lòng liên hệ với chúng tôi:

Email: support@evtradehub.com
Điện thoại: 1-800-EV-TRADE
Địa chỉ: 123 EV Street, Tech City, Country

Chúng tôi sẽ phản hồi yêu cầu của bạn trong vòng 48 giờ.`,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Điều Khoản Dịch Vụ</h1>
          <p className="text-slate-300">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">
            Lưu ý quan trọng
          </h2>
          <p className="text-amber-800">
            Vui lòng đọc kỹ các điều khoản dịch vụ này trước khi sử dụng nền
            tảng. Bằng việc sử dụng EVTradeHub, bạn đồng ý tuân theo tất cả các
            điều khoản và điều kiện được nêu dưới đây.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <Card
              key={section.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {section.title}
                </h2>
                <svg
                  className={`w-6 h-6 text-slate-500 transition-transform ${
                    expandedSections.includes(section.id)
                      ? "transform rotate-180"
                      : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>

              {expandedSections.includes(section.id) && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {section.content}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-6 bg-slate-100 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Thông tin bổ sung
          </h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start">
              <span className="text-slate-400 mr-3 mt-1">•</span>
              <span>
                <strong>Chính sách bảo mật:</strong> Xem cách chúng tôi xử lý dữ
                liệu của bạn
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-3 mt-1">•</span>
              <span>
                <strong>Chính sách hoàn trả:</strong> Tìm hiểu về quyền hoàn trả
                của bạn
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-3 mt-1">•</span>
              <span>
                <strong>Hỗ trợ khách hàng:</strong> Liên hệ với chúng tôi để
                được trợ giúp
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p>&copy; 2025 EVTradeHub. Tất cả các quyền được bảo lưu.</p>
          <p className="text-sm mt-2">
            Những điều khoản này tuân theo luật pháp của quốc gia nơi dịch vụ
            được cung cấp.
          </p>
        </div>
      </footer>
    </div>
  );
}
