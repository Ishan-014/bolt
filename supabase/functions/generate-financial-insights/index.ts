import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get user's financial profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('financial_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Financial profile not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Generate insights based on financial profile
    const insights = []

    // Budget insight
    if (profile.monthly_income && profile.monthly_expenses) {
      const savingsRate = ((profile.monthly_income - profile.monthly_expenses) / profile.monthly_income) * 100
      
      if (savingsRate < 10) {
        insights.push({
          insight_type: 'budget',
          title: 'Improve Your Savings Rate',
          content: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income. Consider reviewing your expenses to find areas where you can cut back.`,
          priority: 'high'
        })
      } else if (savingsRate >= 20) {
        insights.push({
          insight_type: 'budget',
          title: 'Excellent Savings Rate!',
          content: `Congratulations! Your savings rate of ${savingsRate.toFixed(1)}% is excellent. You're on track for strong financial health.`,
          priority: 'low'
        })
      }
    }

    // Investment insight based on risk tolerance and experience
    if (profile.risk_tolerance && profile.investment_experience) {
      let investmentAdvice = ''
      
      if (profile.investment_experience === 'beginner') {
        investmentAdvice = 'As a beginner investor, consider starting with low-cost index funds or ETFs. These provide diversification and are perfect for building your investment foundation.'
      } else if (profile.risk_tolerance === 'high' && profile.investment_experience === 'advanced') {
        investmentAdvice = 'With your high risk tolerance and advanced experience, you might consider allocating a portion of your portfolio to growth stocks or emerging markets for potentially higher returns.'
      }

      if (investmentAdvice) {
        insights.push({
          insight_type: 'investment',
          title: 'Investment Strategy Recommendation',
          content: investmentAdvice,
          priority: 'medium'
        })
      }
    }

    // Savings goal insight
    if (profile.savings_goal && profile.monthly_income && profile.monthly_expenses) {
      const monthlySavings = profile.monthly_income - profile.monthly_expenses
      const monthsToGoal = profile.savings_goal / monthlySavings
      
      insights.push({
        insight_type: 'savings',
        title: 'Savings Goal Timeline',
        content: `Based on your current savings rate, you'll reach your goal of $${profile.savings_goal.toLocaleString()} in approximately ${Math.ceil(monthsToGoal)} months. Consider increasing your savings rate to reach your goal faster.`,
        priority: 'medium'
      })
    }

    // Insert insights into database
    if (insights.length > 0) {
      const insightsToInsert = insights.map(insight => ({
        ...insight,
        user_id: user.id
      }))

      const { error: insertError } = await supabaseClient
        .from('financial_insights')
        .insert(insightsToInsert)

      if (insertError) {
        throw insertError
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Financial insights generated successfully',
        insights_count: insights.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})