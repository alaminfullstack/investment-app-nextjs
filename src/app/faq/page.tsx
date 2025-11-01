'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ChevronDown, 
  ChevronUp, 
  Search,
  HelpCircle,
  DollarSign,
  Users,
  Shield,
  CreditCard
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  icon: any
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I get started with investing?',
    answer: 'Getting started is easy! First, create an account by clicking the "Sign Up" button. Once your account is verified, you can deposit funds and choose from our available investment packages. Each package has different returns and duration periods, so you can select the one that best fits your financial goals.',
    category: 'Getting Started',
    icon: HelpCircle
  },
  {
    id: '2',
    question: 'What are the minimum and maximum investment amounts?',
    answer: 'Our minimum investment amount starts from $50, making it accessible for everyone. The maximum investment amount varies depending on the package you choose, ranging from $1,000 to $50,000. You can invest in multiple packages if you wish to diversify your portfolio.',
    category: 'Investments',
    icon: DollarSign
  },
  {
    id: '3',
    question: 'How and when do I receive my returns?',
    answer: 'Returns are credited to your account balance daily based on the package you\'ve chosen. You can withdraw your returns at any time once they reach the minimum withdrawal amount of $10. All returns are automatically calculated and added to your account balance.',
    category: 'Returns',
    icon: DollarSign
  },
  {
    id: '4',
    question: 'Is my investment safe and secure?',
    answer: 'Absolutely! We use bank-level security measures including SSL encryption, two-factor authentication, and secure servers to protect your investments and personal information. Additionally, we are fully licensed and regulated, and we maintain insurance coverage for added protection.',
    category: 'Security',
    icon: Shield
  },
  {
    id: '5',
    question: 'How does the referral program work?',
    answer: 'Our referral program allows you to earn commissions by inviting others to join the platform. When someone signs up using your referral ID and makes an investment, you earn a commission based on their investment amount. We offer multi-level commissions, so you can earn from your direct referrals and their referrals too.',
    category: 'Referrals',
    icon: Users
  },
  {
    id: '6',
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including bank transfers, credit/debit cards, PayPal, and popular cryptocurrencies like Bitcoin and Ethereum. All payment methods are processed securely, and we support multiple currencies for your convenience.',
    category: 'Payments',
    icon: CreditCard
  },
  {
    id: '7',
    question: 'How long does it take to process withdrawals?',
    answer: 'Withdrawal requests are typically processed within 24-48 hours. The exact time depends on your payment method and bank processing times. Cryptocurrency withdrawals are usually the fastest, often completing within a few hours, while bank transfers may take 2-5 business days.',
    category: 'Withdrawals',
    icon: CreditCard
  },
  {
    id: '8',
    question: 'Are there any fees for investing or withdrawing?',
    answer: 'We believe in transparent pricing. There are no hidden fees for investing. Withdrawal fees vary depending on the payment method: cryptocurrency withdrawals have a small network fee, while bank transfers may have a processing fee. All fees are clearly displayed before you confirm any transaction.',
    category: 'Fees',
    icon: DollarSign
  },
  {
    id: '9',
    question: 'Can I have multiple investment packages?',
    answer: 'Yes! You can invest in multiple packages simultaneously. This is actually a great way to diversify your investment portfolio and balance risk and returns. Each package operates independently, and you\'ll receive returns from all your active investments.',
    category: 'Investments',
    icon: DollarSign
  },
  {
    id: '10',
    question: 'What happens if I need to close my account?',
    answer: 'If you need to close your account, you can withdraw all your funds first, then contact our support team to process the account closure. We\'ll guide you through the process and ensure all your pending transactions are completed before closing the account.',
    category: 'Account',
    icon: HelpCircle
  }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Getting Started', 'Investments', 'Returns', 'Security', 'Referrals', 'Payments', 'Withdrawals', 'Fees', 'Account']

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-blue-100">
              Find answers to common questions about our investment platform
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or browse all categories.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg text-left">
                        {item.question}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.category}
                      </span>
                      {expandedItems.includes(item.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {expandedItems.includes(item.id) && (
                  <CardContent className="pt-0">
                    <div className="pl-11 text-gray-600 leading-relaxed">
                      {item.answer}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Still Need Help */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="/contact">Contact Support</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth/register">Get Started</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}